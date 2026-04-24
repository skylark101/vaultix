const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* ───────────────── helpers ───────────────── */

function calculateTotal(asset) {
  if (!asset.isRecurring || !asset.recurringAmount || !asset.startDate) {
    return asset.amountInvested;
  }

  const start = new Date(asset.startDate);
  const now = new Date();

  if (start > now) return asset.amountInvested;

  const diffMs = now - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let cycles = 0;

  switch (asset.recurringType) {
    case "daily":
      cycles = diffDays;
      break;
    case "monthly":
      cycles =
        (now.getFullYear() - start.getFullYear()) * 12 +
        (now.getMonth() - start.getMonth());
      break;
    case "quarterly":
      cycles = Math.floor(
        ((now.getFullYear() - start.getFullYear()) * 12 +
          (now.getMonth() - start.getMonth())) / 3
      );
      break;
    case "semiannual":
      cycles = Math.floor(
        ((now.getFullYear() - start.getFullYear()) * 12 +
          (now.getMonth() - start.getMonth())) / 6
      );
      break;
    case "yearly":
      cycles = now.getFullYear() - start.getFullYear();
      break;
    case "custom":
      if (asset.recurringInterval) {
        cycles = Math.floor(diffDays / asset.recurringInterval);
      }
      break;
  }

  return asset.amountInvested + cycles * asset.recurringAmount;
}

/* ───────────────── core ───────────────── */

async function getAssets(userId, { type, search } = {}) {
  const where = { userId };
  if (type) where.type = type;
  if (search) where.name = { contains: search, mode: "insensitive" };

  return prisma.asset.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

async function getAssetById(id, userId) {
  const asset = await prisma.asset.findFirst({ where: { id, userId } });
  if (!asset)
    throw Object.assign(new Error("Asset not found"), { status: 404 });
  return asset;
}

async function createAsset(userId, data) {
  const asset = await prisma.asset.create({
    data: {
      userId,
      name: data.name,
      type: data.type,
      amountInvested: parseFloat(data.amountInvested),
      startDate: data.startDate ? new Date(data.startDate) : null,
      maturityDate: data.maturityDate ? new Date(data.maturityDate) : null,
      interestRate:
        data.interestRate != null ? parseFloat(data.interestRate) : null,
      notes: data.notes || null,
      documentUrl: data.documentUrl || null,
      customFields: data.customFields || {},
      isRecurring: data.isRecurring || false,
      recurringAmount: data.isRecurring
        ? parseFloat(data.recurringAmount)
        : null,
      recurringType: data.isRecurring ? data.recurringType : null,
      recurringInterval:
        data.isRecurring && data.recurringType === "custom"
          ? parseInt(data.recurringInterval)
          : null,
    },
  });

  // lightweight history log
  await prisma.assetHistory.create({
    data: {
      assetId: asset.id,
      action: "CREATED",
      newValue: `Created with ₹${asset.amountInvested}`,
    },
  });

  return asset;
}

async function updateAsset(id, userId, data) {
  const old = await getAssetById(id, userId);

  // normalize inputs
  const newAmount = parseFloat(data.amountInvested);
  const newRate =
    data.interestRate != null ? parseFloat(data.interestRate) : null;
  const newRecurringAmount = data.isRecurring
    ? parseFloat(data.recurringAmount)
    : null;

  const updated = await prisma.asset.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      amountInvested: newAmount,
      startDate: data.startDate ? new Date(data.startDate) : null,
      maturityDate: data.maturityDate ? new Date(data.maturityDate) : null,
      interestRate: newRate,
      notes: data.notes || null,
      documentUrl: data.documentUrl || null,
      customFields: data.customFields || {},
      isRecurring: data.isRecurring || false,
      recurringAmount: newRecurringAmount,
      recurringType: data.isRecurring ? data.recurringType : null,
      recurringInterval:
        data.isRecurring && data.recurringType === "custom"
          ? parseInt(data.recurringInterval)
          : null,
    },
  });

  const changes = [];

  // amount
  if (old.amountInvested !== newAmount) {
    changes.push({
      field: "amount",
      oldValue: String(old.amountInvested),
      newValue: String(newAmount),
    });
  }

  // interest
  if (old.interestRate !== newRate) {
    changes.push({
      field: "interestRate",
      oldValue: String(old.interestRate),
      newValue: String(newRate),
    });
  }

  // recurring toggle
  if (old.isRecurring !== data.isRecurring) {
    changes.push({
      field: "recurring",
      oldValue: String(old.isRecurring),
      newValue: String(data.isRecurring),
    });
  }

  // recurring amount
  if (old.recurringAmount !== newRecurringAmount) {
    changes.push({
      field: "recurringAmount",
      oldValue: String(old.recurringAmount),
      newValue: String(newRecurringAmount),
    });
  }

  // recurring type
  if (old.recurringType !== data.recurringType) {
    changes.push({
      field: "recurringType",
      oldValue: String(old.recurringType),
      newValue: String(data.recurringType),
    });
  }

  if (changes.length) {
    await prisma.assetHistory.createMany({
      data: changes.map((c) => ({
        assetId: id,
        action: "UPDATED",
        field: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
      })),
    });
  }

  return updated;
}

async function deleteAsset(id, userId) {
  await getAssetById(id, userId);

  await prisma.assetHistory.create({
    data: {
      assetId: id,
      action: "DELETED",
    },
  });

  return prisma.asset.delete({ where: { id } });
}

async function getAssetHistory(id, userId) {
  await getAssetById(id, userId);

  return prisma.assetHistory.findMany({
    where: { assetId: id },
    orderBy: { createdAt: "desc" },
  });
}

async function getDashboardStats(userId) {
  const assets = await prisma.asset.findMany({ where: { userId } });

  const total = assets.reduce((sum, a) => sum + calculateTotal(a), 0);

  const recent = await prisma.asset.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const byType = assets.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + calculateTotal(a);
    return acc;
  }, {});

  return {
    totalInvested: total,
    totalAssets: assets.length,
    recentAssets: recent,
    byType,
  };
}

async function getAssetTypes(userId) {
  const assets = await prisma.asset.findMany({
    where: { userId },
    select: { type: true },
    distinct: ["type"],
  });
  return assets.map((a) => a.type);
}

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetHistory,
  getDashboardStats,
  getAssetTypes,
};