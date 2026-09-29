import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const variants: Record<string, Array<{ name: string; duration: string; price: number; isPopular?: boolean }>> = {
  "gold": [
    { name: "1 tài khoản", duration: "Quay 3s", price: 79000 },
    { name: "1 tài khoản", duration: "Quay 15s", price: 109000 },
  ],
  "vip": [
    { name: "1 tài khoản", duration: "", price: 99000, isPopular: true },
    { name: "2 tài khoản", duration: "", price: 180000 },
    { name: "3 tài khoản", duration: "", price: 250000 },
    { name: "5 tài khoản", duration: "", price: 330000 },
  ],
  "luxury": [
    { name: "1 tài khoản", duration: "", price: 149000, isPopular: true },
    { name: "2 tài khoản", duration: "", price: 279000 },
    { name: "3 tài khoản", duration: "", price: 399000 },
    { name: "5 tài khoản", duration: "", price: 499000 },
  ],
};

async function main() {
  const services = await prisma.service.findMany();

  for (const service of services) {
    const list = variants[service.type] || [];
    if (!list.length) continue;

    await prisma.servicePackage.deleteMany({ where: { serviceId: service.id } });

    for (let i = 0; i < list.length; i++) {
      const v = list[i];
      await prisma.servicePackage.create({
        data: {
          serviceId: service.id,
          name: v.name,
          duration: v.duration,
          price: v.price,
          isPopular: !!v.isPopular,
          order: i,
        },
      });
    }
    console.log(`✓ ${service.name}: ${list.length} variants`);
  }

  console.log("✅ Done");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
