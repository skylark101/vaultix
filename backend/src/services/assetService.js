const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAssets(userId, { type, search } = {}) {
  const where = { userId };
  if (type) where.type = type;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  return prisma.asset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

async function getAssetById(id, userId) {
  const asset = await prisma.asset.findFirst({ where: { id, userId } });
  if (!asset) throw Object.assign(new Error('Asset not found'), { status: 404 });
  return asset;
}

async function createAsset(userId, data) {
  return prisma.asset.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      amountInvested: parseFloat(data.amountInvested),
      startDate: data.startDate ? new Date(data.startDate) : null,
      maturityDate: data.maturityDate ? new Date(data.maturityDate) : null,   
      interestRate: data.interestRate != null ? parseFloat(data.interestRate) : null,
      notes: data.notes || null,
      documentUrl: data.documentUrl || null,
      customFields: data.customFields || {},
    },
  });
}

async function updateAsset(id, userId, data) {
  await getAssetById(id, userId);
  return prisma.asset.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      amountInvested: parseFloat(data.amountInvested),
      startDate: data.startDate ? new Date(data.startDate) : null,
      maturityDate: data.maturityDate ? new Date(data.maturityDate) : null,   // ← new
      interestRate: data.interestRate != null ? parseFloat(data.interestRate) : null,  // ← new
      notes: data.notes || null,
      documentUrl: data.documentUrl || null,
      customFields: data.customFields || {},
    },
  });
}

async function deleteAsset(id, userId) {
  await getAssetById(id, userId);
  return prisma.asset.delete({ where: { id } });
}

async function getDashboardStats(userId) {
  const assets = await prisma.asset.findMany({ where: { userId } });
  const total = assets.reduce((sum, a) => sum + a.amountInvested, 0);
  const recent = await prisma.asset.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  const byType = assets.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + a.amountInvested;
    return acc;
  }, {});

  return { totalInvested: total, totalAssets: assets.length, recentAssets: recent, byType };
}

async function getAssetTypes(userId) {
  const assets = await prisma.asset.findMany({ where: { userId }, select: { type: true }, distinct: ['type'] });
  return assets.map(a => a.type);
}

module.exports = { getAssets, getAssetById, createAsset, updateAsset, deleteAsset, getDashboardStats, getAssetTypes };