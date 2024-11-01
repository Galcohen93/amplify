import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates three tables: Todo, Alarm, and realtimeDashboard. 
The realtimeDashboard table includes fields like sysTime, device_id, 
device_timestamp, jitter_median, etc. The authorization rule below specifies 
that only the owner can access their records.
=========================================================================*/
const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      isDone: a.boolean(),
    })
    .authorization((allow) => [allow.owner()]),

  Alarm: a
    .model({
      status: a.boolean(),
    })
    .authorization((allow) => [allow.owner()]),

  realtimeDashboard: a
    .model({
      sysTime: a.string(),
      device_id: a.string(),          // Use a.int32() here
      device_timestamp: a.string(),   // Use a.int32() here
      jitter_median: a.float(),
      jitter_status: a.boolean(),
      jitter_threshold: a.float(),
      status: a.boolean(),
      wander_average: a.float(),
      wander_status: a.boolean(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
