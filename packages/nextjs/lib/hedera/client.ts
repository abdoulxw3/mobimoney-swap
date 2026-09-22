import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";

export function getHederaTestnetClient(): Client {
  const operatorId = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;

  if (!operatorId || !operatorKey) {
    throw new Error("Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_KEY in env");
  }

  const client = Client.forTestnet();
  client.setOperator(AccountId.fromString(operatorId), PrivateKey.fromStringECDSA(operatorKey));
  return client;
}
