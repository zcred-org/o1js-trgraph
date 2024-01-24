# O1JS Transformation Graph - O1JS TrGraph

## Usage

```typescript
import {O1TrGraph} from "o1js-trgraph";
import * as o1js from "o1js";

const trGraph = new O1TrGraph(o1js);
const result = trGraph.objectTransform({
  name: "Test",
  age: 18
}, {
  name: ["utf8-mina:string"],
  age: ["uin64-mina:field"]
});
assert.equal(result, {
  transformed: {
    name: CircuitString.fromString("Test"), 
    age: Field(18) 
  },
  linear: [CircuitString.fromString("Test"), Field(18)]
});

trGraph.transform(11, ["uin16-mina:uint64"]) // UInt.from(11)
```

## Extended Links

```typescript
  "mina:field",
  "mina:fields",
  "mina:bool",
  "mina:publickey",
  "mina:privatekey",
  "mina:signature",
  "mina:string",
  "mina:uint64",
  "uint16-mina:field",
  "uint32-mina:field",
  "uint64-mina:field",
  "uint128-mina:field",
  "uint256-mina:field",
  "uint-mina:field",
  "mina:field-uint256",
  "mina:field-uint",
  "uint16-mina:uint64",
  "uint32-mina:uint64",
  "uint64-mina:uint64",
  "uint-mina:uint64",
  "mina:uint64-uint64",
  "mina:uint64-uint128",
  "mina:uint64-uint256",
  "mina:uint64-uint",
  "utf8-mina:string",
  "ascii-mina:string",
  "mina:string-ascii",
  "mina:uint64-mina:fields",
  "mina:fields-mina:uint64",
  "mina:uint64-mina:field",
  "mina:field-mina:uint64",
  "base58-mina:signature",
  "mina:signature-base58",
  "mina:signature-mina:fields",
  "mina:fields-mina:signature",
  "base58-mina:publickey",
  "mina:publickey-base58",
  "mina:publickey-mina:fields",
  "mina:fields-mina:publickey",
  "base58-mina:privatekey",
  "mina:privatekey-base58",
  "mina:privatekey-mina:fields",
  "mina:fields-mina:privatekey",
  "boolean-mina:bool",
  "mina:bool-mina:field",
  "mina:bool-mina:fields",
  "mina:fields-mina:bool",
  "mina:bool-boolean",
  "mina:mod.order",
  "mina:string-mina:fields",
  "mina:fields-mina:string"
```

See default links [here](https://github.com/zcred-org/trgraph)
