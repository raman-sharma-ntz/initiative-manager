import 'dotenv/config';
import { Client, SimpleFieldType, RelationalFieldType } from '@hygraph/management-sdk';

const token = process.env.HYGRAPH_TOKEN;
const endpoint = process.env.HYGRAPH_ENDPOINT;

if (!token || !endpoint) {
  console.error("Missing HYGRAPH_TOKEN or HYGRAPH_ENDPOINT in your .env file.");
  process.exit(1);
}



async function run() {
  const migrationName = `Migration_${Date.now()}`;
  console.log(`🚀 Starting Consolidated Migration: ${migrationName}`);

  const client = new Client({
    authToken: token as string,
    endpoint: endpoint as string,
    name: migrationName,
  });

  // 1. Missing Models
  client.createModel({ apiId: 'AppUser', apiIdPlural: 'AppUsers', displayName: 'App User' });
  client.createModel({ apiId: 'Team', apiIdPlural: 'Teams', displayName: 'Team' });
  client.createModel({ apiId: 'Ticket', apiIdPlural: 'Tickets', displayName: 'Ticket' });

  // 2. Missing Fields
  // AppUser fields
  client.createSimpleField({ parentApiId: 'AppUser', apiId: 'clerkId', displayName: 'Clerk ID', type: SimpleFieldType.String, isUnique: true, isRequired: true });
  client.createSimpleField({ parentApiId: 'AppUser', apiId: 'email', displayName: 'Email', type: SimpleFieldType.String, isUnique: true, isRequired: true });
  client.createSimpleField({ parentApiId: 'AppUser', apiId: 'name', displayName: 'Name', type: SimpleFieldType.String });
  client.createEnumerableField({ parentApiId: 'AppUser', apiId: 'role', displayName: 'Role', enumerationApiId: 'Role', isRequired: true });

  // Team fields
  client.createSimpleField({ parentApiId: 'Team', apiId: 'name', displayName: 'Name', type: SimpleFieldType.String, isUnique: true, isRequired: true });

  // Ticket fields
  client.createSimpleField({ parentApiId: 'Ticket', apiId: 'title', displayName: 'Title', type: SimpleFieldType.String, isRequired: true });
  client.createSimpleField({ parentApiId: 'Ticket', apiId: 'description', displayName: 'Description', type: SimpleFieldType.String });
  client.createSimpleField({ parentApiId: 'Ticket', apiId: 'points', displayName: 'Points', type: SimpleFieldType.Int });
  client.createEnumerableField({ parentApiId: 'Ticket', apiId: 'ticketStatus', displayName: 'Status', enumerationApiId: 'TicketStatus' });
  client.createEnumerableField({ parentApiId: 'Ticket', apiId: 'priority', displayName: 'Priority', enumerationApiId: 'TicketPriority' });
  client.createEnumerableField({ parentApiId: 'Ticket', apiId: 'visibility', displayName: 'Visibility', enumerationApiId: 'TicketVisibility' });

  // 3. Relations
  client.createRelationalField({ parentApiId: 'Team', apiId: 'lead', displayName: 'Team Lead', type: RelationalFieldType.Relation, reverseField: { modelApiId: 'AppUser', apiId: 'ledTeam', displayName: 'Led Team', isList: false } });
  client.createRelationalField({ parentApiId: 'Team', apiId: 'members', displayName: 'Team Members', type: RelationalFieldType.Relation, isList: true, reverseField: { modelApiId: 'AppUser', apiId: 'teams', displayName: 'Teams', isList: true } });
  client.createRelationalField({ parentApiId: 'Ticket', apiId: 'initiative', displayName: 'Program', type: RelationalFieldType.Relation, reverseField: { modelApiId: 'Program', apiId: 'tickets', displayName: 'Tickets', isList: true } });
  client.createRelationalField({ parentApiId: 'Ticket', apiId: 'team', displayName: 'Team', type: RelationalFieldType.Relation, reverseField: { modelApiId: 'Team', apiId: 'tickets', displayName: 'Tickets', isList: true } });
  client.createRelationalField({ parentApiId: 'Ticket', apiId: 'assignee', displayName: 'Assignee', type: RelationalFieldType.Relation, reverseField: { modelApiId: 'AppUser', apiId: 'assignedTickets', displayName: 'Assigned Tickets', isList: true } });
  client.createRelationalField({ parentApiId: 'Ticket', apiId: 'author', displayName: 'Creator', type: RelationalFieldType.Relation, reverseField: { modelApiId: 'AppUser', apiId: 'createdTickets', displayName: 'Created Tickets', isList: true } });

  console.log("⌛ Submitting final migration batch to Hygraph...");
  try {
    const res = await client.run(true);
    if (res.errors) {
      console.error("❌ Migration had errors:", res.errors);
    } else {
      console.log("✅ Migration successful!");
    }
  } catch (err: any) {
    console.error("❌ Fatal error during migration:", err.message || err);
  }
}

run();
