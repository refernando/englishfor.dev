import database from "@/infra/database";
import authentication from "@/models/authentication";
import authorization from "@/models/authorization";
import users from "@/models/users";

export async function GET(request) {
  const userId = await authentication.getUserId(request);

  const user = await users.getById(userId);

  if (!user) return Response.json({ success: false });

  if (!authorization.can(user, 'admin')) return Response.json({ success: false });

  await runCommands(database.databaseDropSQL);
  await runCommands(database.databaseModelSQL);
  await runCommands(database.databaseDataModelSQL);

  return Response.json({ success: true });
}

async function runCommands(sqlCommands) {
  const commands = sqlCommands.trim().split(";");
  for (const command of commands) {
    const safeCommand = command.trim() + ";";
    if (safeCommand) {
      try {
        await database.query(safeCommand);
        console.log(`Executed: ${safeCommand}`);
      } catch (e) {
        console.log(`Error executing command: ${safeCommand}`);
        console.error(e);
      }
    }
  }
}
