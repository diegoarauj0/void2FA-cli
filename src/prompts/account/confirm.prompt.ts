import inquirer from "inquirer";

export async function confirmPrompt(name: string, message: string): Promise<boolean> {
  try {
    const result = await inquirer.prompt<{ [name]: boolean }>({
      type: "confirm",
      name: name,
      message: message,
      default: true,
      prefix: "›",
    });

    return result[name] || false;
  } catch {
    console.log("\n👋 Operation cancelled.");
    process.exit(0);
  }
}
