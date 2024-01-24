import { suite } from "uvu";
import * as a from "uvu/assert";
import { CircuitString, Field, PrivateKey, Signature } from "o1js";
import { O1TrGraph } from "../src/graph.js";
import { TrSchema } from "trgraph";
import { O1GraphLink } from "../src/index.js";
import * as o1js from "o1js";

const test = suite("O1TrGraph object transform tests");

test("object transform", () => {
  const tg = new O1TrGraph(o1js);
  const privatekey = PrivateKey.random();
  const signature = Signature.create(privatekey, [Field(1n)]);
  const schema: TrSchema<O1GraphLink> = {
    other: {
      publickey: ["base58-mina:publickey", "mina:publickey-mina:fields", "mina:fields-mina:publickey"],
      signature: ["base58-mina:signature"]
    },
    age: ["uint64-mina:field"],
    name: ["ascii-mina:string"]
  };
  const { transformed, linear } = tg.objectTransform({
    other: {
      publickey: privatekey.toPublicKey().toBase58(),
      signature: signature.toBase58()
    },
    age: 25,
    name: "test"
  }, schema);
  a.equal(
    transformed, {
      other: {
        publickey: privatekey.toPublicKey(),
        signature: signature
      },
      age: Field(25),
      name: CircuitString.fromString("test")
    }
  );
  a.equal(
    linear,
    [privatekey.toPublicKey(), signature, Field(25), CircuitString.fromString("test")]
  );
  a.equal(
    tg.objectTransform(
      { signature: signature.toBase58() },
      { signature: ["base58-mina:signature", "mina:signature-mina:fields"] }
    ).linear,
    signature.toFields()
  );
});

test.run();