import { SearchAccountsCommand } from "./account/searchAccount.command.js";
import { CreateAccountCommand } from "./account/createAccount.command.js";
import { ListAccountsCommand } from "./account/listAccount.command.js";
import { PingCommand } from "./ping.command.js";
import { CodeAccountCommand } from "./account/codeAccount.command.js";
import { EditAccountCommand } from "./account/editAccount.command.js";
import { DeleteAccountCommand } from "./account/deleteAccount.command.js";

export default [
  new PingCommand(),
  new CreateAccountCommand(),
  new EditAccountCommand(),
  new ListAccountsCommand(),
  new SearchAccountsCommand(),
  new CodeAccountCommand(),
  new DeleteAccountCommand()
];
