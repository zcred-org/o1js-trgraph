import { TrGraph, type TrLink, type TrNode } from "trgraph";
import { Bool, CircuitString, Field, PrivateKey, PublicKey, Signature, UInt64 } from "o1js";


export const O1_TR_NODES: TrNode[] = [
  {
    name: "mina:field",
    isType: (value: unknown) => value instanceof Field
  },
  {
    name: "mina:fields",
    spread: true,
    isType: (value: unknown) => {
      if (!Array.isArray(value)) return false;
      return value.filter((it) => it instanceof Field).length === value.length;
    }
  },
  {
    name: "mina:bool",
    isType: (value: unknown) => value instanceof Bool
  },
  {
    name: "mina:publickey",
    isType: (value: unknown) => value instanceof PublicKey
  },
  {
    name: "mina:privatekey",
    isType: (value: unknown) => value instanceof PrivateKey
  },
  {
    name: "mina:signature",
    isType: (value: unknown) => value instanceof Signature
  },
  {
    name: "mina:string",
    isType: (value: unknown) => value instanceof CircuitString
  },
  {
    name: "mina:uint64",
    isType: (value: unknown) => value instanceof UInt64
  }
];

const UITS = [
  "uint16",
  "uint32",
  "uint64",
  "uint128",
  "uint256",
  "uint"
];

function defaultLinks(): TrLink[] {
  const result: TrLink[] = [];
  for (const node of O1_TR_NODES) {
    result.push({
      name: node.name,
      inputType: node.name,
      outputType: node.name,
      transform: (value) => value
    });
  }
  return result;
}

function uintsToField(): TrLink[] {
  const result: TrLink[] = [];
  for (const uint of UITS) {
    result.push({
      name: `${uint}-mina:field`,
      inputType: uint,
      outputType: "mina:field",
      transform: (value: bigint | number) => new Field(value)
    });
  }
  return result;
}

function fieldToUints(): TrLink[] {
  const result: TrLink[] = [];
  for (const uint of ["uint256", "uint"]) {
    result.push({
      name: `mina:field-${uint}`,
      inputType: "mina:field",
      outputType: uint,
      transform: (value: Field) => value.toBigInt()
    });
  }
  return result;
}

function uintToMinaUint64(): TrLink[] {
  const result: TrLink[] = [];
  for (const uint of ["uint16", "uint32", "uint64", "uint"]) {
    result.push({
      name: `${uint}-mina:uint64`,
      inputType: uint,
      outputType: "mina:uint64",
      transform: (value: bigint | number) => UInt64.from(new Field(value))
    });
  }
  return result;
}

function minaUint64ToUints(): TrLink[] {
  const result: TrLink[] = [];
  for (const uint of ["uint64", "uint128", "uint256", "uint"]) {
    result.push({
      name: `mina:uint64-${uint}`,
      inputType: "mina:uint64",
      outputType: uint,
      transform: (value: UInt64) => value.toBigInt()
    });
  }
  return result;
}

function stringsToMinaStrings(): TrLink[] {
  const result: TrLink[] = [];
  for (const str of ["utf8", "ascii"]) {
    result.push({
      name: `${str}-mina:string`,
      inputType: str,
      outputType: "mina:string",
      transform: (value: string) => CircuitString.fromString(value)
    });
  }
  return result;
}

function minaStringToStrings(): TrLink[] {
  const result: TrLink[] = [];
  for (const str of ["ascii"]) {
    result.push({
      name: `mina:string-${str}`,
      inputType: "mina:string",
      outputType: str,
      transform: (value: CircuitString) => value.toString()
    });
  }
  return result;
}


export const O1_TR_LINKS: TrLink[] = [
  ...defaultLinks(),
  ...uintsToField(),
  ...fieldToUints(),
  ...uintToMinaUint64(),
  ...minaUint64ToUints(),
  ...stringsToMinaStrings(),
  ...minaStringToStrings(),
  {
    name: "mina:uint64-mina:fields",
    inputType: "mina:uint64",
    outputType: "mina:fields",
    transform: (value: UInt64) => value.toFields()
  },
  {
    name: "mina:fields-mina:uint64",
    inputType: "mina:fields",
    outputType: "mina:uint64",
    transform: (value: Field[]) => UInt64.fromFields(value)
  },
  {
    name: "mina:uint64-mina:field",
    inputType: "mina:uint64",
    outputType: "mina:field",
    transform: (value: UInt64) => value.toFields()[0]!
  },
  {
    name: "mina:field-mina:uint64",
    inputType: "mina:field",
    outputType: "mina:uint64",
    transform: (value: Field) => UInt64.from(value)
  },
  {
    name: "base58-mina:signature",
    inputType: "base58",
    outputType: "mina:signature",
    transform: (value: string) => Signature.fromBase58(value)
  },
  {
    name: "mina:signature-base58",
    inputType: "mina:signature",
    outputType: "base58",
    transform: (value: Signature) => value.toBase58()
  },
  {
    name: "mina:signature-mina:fields",
    inputType: "mina:signature",
    outputType: "mina:fields",
    transform: (value: Signature) => value.toFields()
  },
  {
    name: "mina:fields-mina:signature",
    inputType: "mina:fields",
    outputType: "mina:signature",
    transform: (value: Field[]) => Signature.fromFields(value)
  },
  {
    name: "base58-mina:publickey",
    inputType: "base58",
    outputType: "mina:publickey",
    transform: (value: string) => PublicKey.fromBase58(value)
  },
  {
    name: "mina:publickey-base58",
    inputType: "mina:publickey",
    outputType: "base58",
    transform: (value: PublicKey) => value.toBase58()
  },
  {
    name: "mina:publickey-mina:fields",
    inputType: "mina:publickey",
    outputType: "mina:fields",
    transform: (value: PublicKey) => value.toFields()
  },
  {
    name: "mina:fields-mina:publickey",
    inputType: "mina:fields",
    outputType: "mina:publickey",
    transform: (value: Field[]) => PublicKey.fromFields(value)
  },
  {
    name: "base58-mina:privatekey",
    inputType: "base58",
    outputType: "mina:privatekey",
    transform: (value: string) => PrivateKey.fromBase58(value)
  },
  {
    name: "mina:privatekey-base58",
    inputType: "mina:privatekey",
    outputType: "base58",
    transform: (value: PrivateKey) => value.toBase58()
  },
  {
    name: "mina:privatekey-mina:fields",
    inputType: "mina:privatekey",
    outputType: "mina:fields",
    transform: (value: PrivateKey) => value.toFields()
  },
  {
    name: "mina:fields-mina:privatekey",
    inputType: "mina:fields",
    outputType: "mina:privatekey",
    transform: (value: Field[]) => PrivateKey.fromFields(value)
  },
  {
    name: "boolean-mina:bool",
    inputType: "boolean",
    outputType: "mina:bool",
    transform: (value: boolean) => new Bool(value)
  },
  {
    name: "mina:bool-mina:field",
    inputType: "mina:bool",
    outputType: "mina:field",
    transform: (value: Bool) => value.toField()
  },
  {
    name: "mina:bool-mina:fields",
    inputType: "mina:bool",
    outputType: "mina:fields",
    transform: (value: Bool) => value.toFields()
  },
  {
    name: "mina:fields-mina:bool",
    inputType: "mina:fields",
    outputType: "mina:bool",
    transform: (value: Field[]) => Bool.fromFields(value)
  },
  {
    name: "mina:bool-boolean",
    inputType: "mina:bool",
    outputType: "boolean",
    transform: (value: Bool) => value.toBoolean()
  },
  {
    name: "mina:mod.order",
    inputType: "uint",
    outputType: "uint",
    transform: (value: number | bigint) => {
      let target = typeof value === "bigint" ? value : BigInt(value);
      return target % Field.ORDER;
    }
  },
  {
    name: "mina:string-mina:fields",
    inputType: "mina:string",
    outputType: "mina:fields",
    transform: (value: CircuitString) => value.toFields()
  },
  {
    name: "mina:fields-mina:string",
    inputType: "mina:fields",
    outputType: "mina:string",
    // @ts-expect-error
    transform: (value: Field[]) => CircuitString.fromFields(value)
  }
];

export class O1TrGraph extends TrGraph {
  constructor() {
    super();
    super.extend(O1_TR_NODES, O1_TR_LINKS);
  }
}