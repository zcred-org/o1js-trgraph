import { suite } from "uvu";
import { Bool, CircuitString, Field, PrivateKey, PublicKey, Signature, UInt64 } from "o1js";
import { O1TrGraph } from "../src/graph.js";
import * as a from "uvu/assert";

const test = suite("Transformation graph tests");

const UINTS = [
  "uint",
  "uint16",
  "uint32",
  "uint64",
  "uint128",
  "uint256"
];

test("uints to field & field to uints", () => {
  const tg = new O1TrGraph();
  for (const uint of UINTS) {
    const field = tg.transform<Field>(1, [`${uint}-mina:field`]);
    a.is(field.toBigInt(), 1n);
  }
  for (const uint of ["uint256", "uint"]) {
    const num = tg.transform(new Field(1), [`mina:field-${uint}`]);
    a.is(num, 1n);
  }
  a.throws(() => tg.transform(new Field(1), ["mina:field-uint128"]));
  a.throws(() => tg.transform(new Field(1), ["mina:field-uint64"]));
  a.throws(() => tg.transform(new Field(1), ["mina:field-uint32"]));
  a.throws(() => tg.transform(new Field(1), ["mina:field-uint16"]));
});

test("uints to mina:uint64 & mina:uint64 to uints", () => {
  const tg = new O1TrGraph();
  for (const uint of ["uint", "uint16", "uint32", "uint64"]) {
    const minaUint64 = tg.transform<UInt64>(50000, [`${uint}-mina:uint64`]);
    a.is(minaUint64.toFields()[0]!.toBigInt(), 50000n);
  }
  for (const uint of ["uint128", "uint256"]) {
    a.throws(() => tg.transform(1n, [`${uint}-mina:uint64`]));
  }
  for (const uint of ["uint", "uint64", "uint128", "uint256"]) {
    const transformed = tg.transform(UInt64.from(1), [`mina:uint64-${uint}`]);
    a.is(transformed, 1n);
  }
  for (const uint of ["uint16", "uint32"]) {
    a.throws(() => tg.transform(UInt64.from(2), [`mina:uint64-${uint}`]));
  }
});

test("mina:uint64 to mina:field(s)", () => {
  const tg = new O1TrGraph();
  const fields = tg.transform<Field[]>(UInt64.from(1n), ["mina:uint64-mina:fields"]);
  a.is(fields[0]!.toBigInt(), 1n);
  const field = tg.transform<Field>(UInt64.from(2n), ["mina:uint64-mina:field"]);
  a.is(field.toBigInt(), 2n);
});

test("mina:field to mina:uint64", () => {
  const tg = new O1TrGraph();
  const transformed = tg.transform<UInt64>(new Field(2n), ["mina:field-mina:uint64"]);
  a.instance(transformed, UInt64);
  a.is(transformed.toBigInt(), 2n);
});

test("mina:fields to mina:uint64", () => {
  const tg = new O1TrGraph();
  const transformed = tg.transform<UInt64>(UInt64.from(2n).toFields(), ["mina:fields-mina:uint64"]);
  a.equal(
    transformed,
    UInt64.from(2n)
  );
});

test("strings to mina:string", () => {
  const tg = new O1TrGraph();
  const fromUtf8 = tg.transform<CircuitString>("😁", ["utf8-mina:string"]);
  a.instance(fromUtf8, CircuitString);
  a.equal(fromUtf8, CircuitString.fromString("😁"));
  const fromASCII = tg.transform<CircuitString>("hello world", ["ascii-mina:string"]);
  a.instance(fromASCII, CircuitString);
  a.equal(fromASCII, CircuitString.fromString("hello world"));
});

test("mina:string to string", () => {
  const tg = new O1TrGraph();
  a.throws(() => tg.transform(CircuitString.fromString("字"), ["mina:string-utf8"]));
  a.is(
    tg.transform(CircuitString.fromString("hello world"), ["mina:string-ascii"]),
    "hello world"
  );
});

test("mina:string to mina:fields", () => {
  const tr = new O1TrGraph();
  const transformed = tr.transform(CircuitString.fromString("hello world"), ["mina:string-mina:fields"]);
  a.equal(transformed, CircuitString.fromString("hello world").toFields());
});

test("mina:fields to mina:string", () => {
  const tg = new O1TrGraph();
  const transformed = tg.transform<CircuitString>(
    CircuitString.fromString("hello world").toFields(),
    ["mina:fields-mina:string"]
  );
  a.is(transformed.toString(), "hello world");
});

test("mina:mod.order", () => {
  const tr = new O1TrGraph();
  const value = 2n ** 256n - 1n;
  a.is(value, 115792089237316195423570985008687907853269984665640564039457584007913129639935n);
  const transformed = tr.transform(value, ["mina:mod.order"]);
  a.is(transformed, 28948022309329048855892746252171976963180815219815881891593553714863226748924n);
});

test("boolean to mina:bool", () => {
  const tr = new O1TrGraph();
  const trTrue = tr.transform<Bool>(true, ["boolean-mina:bool"]);
  a.instance(trTrue, Bool);
  a.is(trTrue.toBoolean(), true);
  a.equal(trTrue.toField(), new Field(1));
  const trFalse = tr.transform<Bool>(false, ["boolean-mina:bool"]);
  a.instance(trTrue, Bool);
  a.is(trFalse.toBoolean(), false);
  a.equal(trFalse.toField(), new Field(0));
});

test("mina:bool to boolean", () => {
  const tr = new O1TrGraph();
  a.is(
    tr.transform(Bool(true), ["mina:bool-boolean"]),
    true
  );
  a.is(
    tr.transform(Bool(false), ["mina:bool-boolean"]),
    false
  );
});

test("mina:bool to mina:field", () => {
  const tr = new O1TrGraph();
  a.equal(
    tr.transform(Bool(true), ["mina:bool-mina:field"]),
    new Field(1)
  );
  a.equal(
    tr.transform(Bool(false), ["mina:bool-mina:field"]),
    new Field(0)
  );
});

test("mina:bool to mina:fields & mina:fields to mina:bool", () => {
  const tg = new O1TrGraph();
  const fromTrue = tg.transform(Bool.fromJSON(true), ["mina:bool-mina:fields", "mina:fields-mina:bool"]);
  const fromFalse = tg.transform(Bool.fromJSON(false), ["mina:bool-mina:fields", "mina:fields-mina:bool"]);
  a.equal(fromTrue, Bool(true));
  a.equal(fromFalse, Bool(false));
});

test("base58 to mina:publickey", () => {
  const tr = new O1TrGraph();
  const publickeyBase58 = PrivateKey.random().toPublicKey().toBase58();
  const publickey = tr.transform(publickeyBase58, ["base58-mina:publickey"]);
  a.equal(publickey, PublicKey.fromBase58(publickeyBase58));
});

test("mina:publickey to base58", () => {
  const tr = new O1TrGraph();
  const publickey = PrivateKey.random().toPublicKey();
  a.is(
    tr.transform(publickey, ["mina:publickey-base58"]),
    publickey.toBase58()
  );
});

test("mina:publickey to mina:fields", () => {
  const tr = new O1TrGraph();
  const publickey = PrivateKey.random().toPublicKey();
  const fields = tr.transform<Field[]>(publickey, ["mina:publickey-mina:fields"]);
  fields.forEach((field) => a.instance(field, Field));
});

test("mina:fields to mina:publickey", () => {
  const tg = new O1TrGraph();
  const publickey = PrivateKey.random().toPublicKey();
  a.equal(
    tg.transform(publickey.toFields(), ["mina:fields-mina:publickey"]),
    publickey
  );
});

test("base58 to mina:privatekey", () => {
  const tg = new O1TrGraph();
  const privatekey = PrivateKey.random();
  a.equal(
    tg.transform(privatekey.toBase58(), ["base58-mina:privatekey"]),
    privatekey
  );
});

test("mina:privatekey to base58", () => {
  const tg = new O1TrGraph();
  const privatekey = PrivateKey.random();
  a.is(
    tg.transform(privatekey, ["mina:privatekey-base58"]),
    privatekey.toBase58()
  );
});

test("mina:privatekey to mina:fields", () => {
  const tg = new O1TrGraph();
  const privatekey = PrivateKey.random();
  const transformed = tg.transform(privatekey, ["mina:privatekey-mina:fields"]);
  a.equal(
    transformed,
    privatekey.toFields()
  );
});

test("mina:fields to mina:privatekey", () => {
  const tg = new O1TrGraph();
  const privatekey = PrivateKey.random();
  const transformed = tg.transform(privatekey.toFields(), ["mina:fields-mina:privatekey"]);
  a.equal(
    transformed,
    privatekey
  );
});

test("base58 to mina:signature", () => {
  const tg = new O1TrGraph();
  const privatekey = PrivateKey.random();
  const signatureBase58 = Signature.create(privatekey, [Field(1)]).toBase58();
  const signature = tg.transform(signatureBase58, ["base58-mina:signature"]);
  a.equal(
    signature,
    Signature.fromBase58(signatureBase58)
  );
});

test("mina:signature to base58", () => {
  const tg = new O1TrGraph();
  const privatekey = PrivateKey.random();
  const signature = Signature.create(privatekey, [Field(1)]);
  const signatureBase58 = tg.transform(signature, ["mina:signature-base58"]);
  a.is(signatureBase58, signature.toBase58());
});

test("mina:signature to mina:fields", () => {
  const tg = new O1TrGraph();
  const privatekey = PrivateKey.random();
  const signature = Signature.create(privatekey, [Field(1)]);
  const transformed = tg.transform<Field[]>(signature, ["mina:signature-mina:fields"]);
  transformed.forEach((it) => a.instance(it, Field));
});

test("mina:fields to mina:signature", () => {
  const tg = new O1TrGraph();
  const privatekey = PrivateKey.random();
  const signature = Signature.create(privatekey, [Field(1)]);
  a.equal(
    tg.transform(signature.toFields(), ["mina:fields-mina:signature"]),
    signature
  );
});

test("mina:field", () => {
  const tg = new O1TrGraph();
  const field = tg.transform(Field(1n), ["mina:field"]);
  a.equal(field, Field(1n));
});

test("mina:fields", () => {
  const tg = new O1TrGraph();
  const fields = tg.transform([Field(1n), Field(2n)], ["mina:fields"]);
  a.equal(fields, [Field(1n), Field(2n)]);
});

test("mina:bool", () => {
  const tg = new O1TrGraph();
  const bool = tg.transform(Bool(true), ["mina:bool"]);
  a.equal(bool, Bool(true));
});

test("mina:publickey", () => {
  const tg = new O1TrGraph();
  const publickey = PrivateKey.random().toPublicKey();
  a.equal(
    tg.transform(publickey, ["mina:publickey"]),
    publickey
  );
});

test("mina:privatekey", () => {
  const tg = new O1TrGraph();
  const privatekey = PrivateKey.random();
  a.equal(
    tg.transform(privatekey, ["mina:privatekey"]),
    privatekey
  );
});

test("mina:signature", () => {
  const tg = new O1TrGraph();
  const privatekey = PrivateKey.random();
  const signature = Signature.create(privatekey, [Field(1n)]);
  a.equal(
    tg.transform(signature, ["mina:signature"]),
    signature
  );
});

test("mina:string", () => {
  const tg = new O1TrGraph();
  a.equal(
    tg.transform(CircuitString.fromString("hello world"), ["mina:string"]),
    CircuitString.fromString("hello world")
  );
});

test("mina:uint64", () => {
  const tg = new O1TrGraph();
  a.equal(
    tg.transform(UInt64.from(2n), ["mina:uint64"]),
    UInt64.from(2n)
  );
});

test("extend graph", () => {
  const tg = new O1TrGraph();
  tg.extend([{
    name: "hello",
    isType: (_) => true
  }], [{
    name: "hello",
    inputType: "hello",
    outputType: "hello",
    transform: (value) => value
  }]);
  const thisNull = tg.transform(null, ["hello"]);
  a.is(thisNull, null);
});

test.run();