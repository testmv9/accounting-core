import { AccountingRepo } from "../src/repo";

async function main() {
    console.log("🚀 Initializing Cloud Database...");

    try {
        await AccountingRepo.fixDatabaseSchema();
        console.log("✅ Success! Database tables created.");
    } catch (error) {
        console.error("❌ Error initializing database:", error);
    } finally {
        process.exit();
    }
}

main();
