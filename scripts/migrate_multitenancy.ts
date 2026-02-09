import { AccountingRepo } from "../src/repo";

async function main() {
    console.log("🚀 Applying Database Schema Extensions for Multi-Tenancy...");
    try {
        await AccountingRepo.fixDatabaseSchema();
        console.log("✅ Tables created or verified.");

        // Check if demo user exists
        const demoEmail = "admin@company.com";
        const existingUser = await AccountingRepo.getUserByEmail(demoEmail);

        let userId: string;
        let membershipsCount = 0;

        if (!existingUser) {
            console.log("➕ Creating demo user...");
            const newUser = await AccountingRepo.createUser({
                name: "Admin User",
                email: demoEmail,
                passwordHash: "admin" // Plain for demo, in real we'd hash
            });
            if (!newUser) throw new Error("Failed to create user");
            userId = newUser.id;
        } else {
            userId = existingUser.id;
            membershipsCount = existingUser.memberships.length;
        }

        // Check if demo tenant exists for this user
        if (membershipsCount === 0) {
            console.log("➕ Creating demo tenant 'Navera Demo'...");
            await AccountingRepo.createTenant({
                name: "Navera Demo",
                ownerId: userId
            });
            console.log("✅ Demo environment ready.");
        } else {
            console.log("ℹ️ Demo environment already exists.");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

main();
