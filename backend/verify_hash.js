import bcrypt from "bcrypt";

const hash = "$2b$10$LQQV5cAPiUh.K7H/B7DkCONzDfGqlBnqqVniqKKK9VV9GKD/2XPYm";

const passwords = [
  "password123",
  "password",
  "123456",
  "admin",
  "admin123",
  "user",
  "test",
  "pansoft",
  "pansoft123",
];

console.log("Probando contraseñas contra el hash...\n");

for (const pwd of passwords) {
  const isMatch = await bcrypt.compare(pwd, hash);
  if (isMatch) {
    console.log(`ENCONTRADO: "${pwd}" coincide con el hash`);
  }
}

console.log(
  "\nNinguna coincidencia encontrada. El hash podría estar corrupto.",
);
