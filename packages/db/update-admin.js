const { PrismaClient } = require('./prisma/generated/prisma');

const prisma = new PrismaClient();

async function updateAdmin() {
    try {
        // Update the user to be an admin
        const updatedUser = await prisma.user.update({
            where: { email: 'admin@soa.ac.in' },
            data: { role: 'ADMIN' }
        });

        console.log('User updated to admin:', updatedUser.email, updatedUser.role);

        // Also create a demo student
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('student123', 10);
        
        try {
            const student = await prisma.user.create({
                data: {
                    name: 'Demo Student',
                    email: 'student@soa.ac.in',
                    password: hashedPassword,
                    role: 'STUDENT',
                    universityId: 'f0331710-899e-4662-aa43-f3354a0e6b93',
                    userStatus: 'VERIFIED'
                }
            });
            console.log('Demo student created:', student.email);
        } catch (e) {
            console.log('Student might already exist');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateAdmin();
