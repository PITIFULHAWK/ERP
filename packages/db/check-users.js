const { PrismaClient } = require('./prisma/generated/prisma');

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        console.log('Checking users in database...');
        
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                userStatus: true
            }
        });

        console.log('Found users:', users.length);
        users.forEach(user => {
            console.log(`- ${user.email} (${user.role}) - ${user.userStatus}`);
        });

        // Check if admin exists
        const admin = await prisma.user.findFirst({
            where: { email: 'admin@soa.ac.in' }
        });

        if (!admin) {
            console.log('\nAdmin user not found. Creating...');
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            const newAdmin = await prisma.user.create({
                data: {
                    name: 'Admin User',
                    email: 'admin@soa.ac.in',
                    password: hashedPassword,
                    role: 'ADMIN',
                    universityId: 'f0331710-899e-4662-aa43-f3354a0e6b93',
                    userStatus: 'VERIFIED'
                }
            });
            console.log('Admin created:', newAdmin.email);
        } else {
            console.log('\nAdmin user exists:', admin.email, admin.role);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
