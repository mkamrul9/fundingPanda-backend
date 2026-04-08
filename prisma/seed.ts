import 'dotenv/config';
import { Prisma, UserRole } from '@prisma/client';
import { auth } from '../src/lib/auth';
import prisma from '../src/lib/prisma';

export const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@panda.com';
        const adminPassword = process.env.ADMIN_PASSWORD || '12345678';

        // Check by email so we can create multiple different admin accounts
        const existingByEmail = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingByEmail) {
            console.log(`User with email ${adminEmail} already exists. Skipping creation.`);
            return;
        }

        // 1. Create the user using BetterAuth so the password is securely hashed
        const adminUser = await auth.api.signUpEmail({
            body: {
                email: adminEmail,
                password: adminPassword,
                name: "System Admin",
                role: UserRole.ADMIN,
            },
        });

        if (!adminUser || !adminUser.user) {
            throw new Error("BetterAuth failed to create the admin user.");
        }

        // 2. Use a transaction to auto-verify the admin bypassing the OTP process
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await tx.user.update({
                where: {
                    id: adminUser.user.id,
                },
                data: {
                    emailVerified: true, // BetterAuth requirement
                    isVerified: true,    // FundingPanda custom requirement
                },
            });
        });

        console.log(`Admin User Created Successfully: ${adminUser.user.email}`);
    } catch (error) {
        console.error("Error seeding admin: ", error);

        // Cleanup: If the process failed halfway, remove the partial user
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@panda.com';
        await prisma.user.deleteMany({
            where: { email: adminEmail },
        });
    }
};

export const seedStudent = async () => {
    try {
        const studentEmail = process.env.STUDENT_EMAIL || 'student@panda.com';
        const studentPassword = process.env.STUDENT_PASSWORD || '12345678';

        const existingByEmail = await prisma.user.findUnique({
            where: { email: studentEmail },
        });

        if (existingByEmail) {
            console.log(`User with email ${studentEmail} already exists. Skipping creation.`);
            return;
        }

        const studentUser = await auth.api.signUpEmail({
            body: {
                email: studentEmail,
                password: studentPassword,
                name: 'Demo Student',
                role: UserRole.STUDENT,
                university: 'FundingPanda University',
            },
        });

        if (!studentUser || !studentUser.user) {
            throw new Error('BetterAuth failed to create the student user.');
        }

        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            await tx.user.update({
                where: {
                    id: studentUser.user.id,
                },
                data: {
                    emailVerified: true,
                    isVerified: true,
                },
            });
        });

        console.log(`Student User Created Successfully: ${studentUser.user.email}`);
    } catch (error) {
        console.error('Error seeding student: ', error);

        const studentEmail = process.env.STUDENT_EMAIL || 'student@panda.com';
        await prisma.user.deleteMany({
            where: { email: studentEmail },
        });
    }
};

async function main() {
    console.log('Starting database seeding process...');
    await seedAdmin();
    await seedStudent();
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

// npx prisma db seed