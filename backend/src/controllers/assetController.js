const assetService = require('../services/assetService');

async function list(req, res, next) {
  try {
    const { type, search } = req.query;
    const assets = await assetService.getAssets(req.user.id, { type, search });
    res.json(assets);
  } catch (err) { next(err); }
}

async function get(req, res, next) {
  try {
    const asset = await assetService.getAssetById(req.params.id, req.user.id);
    res.json(asset);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const asset = await assetService.createAsset(req.user.id, req.body);
    res.status(201).json(asset);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const asset = await assetService.updateAsset(req.params.id, req.user.id, req.body);
    res.json(asset);
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await assetService.deleteAsset(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) { next(err); }
}

async function getAssetHistory(req, res, next) {
  try {
    const data = await assetService.getAssetHistory(req.params.id, req.user.id)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

async function dashboard(req, res, next) {
  try {
    const stats = await assetService.getDashboardStats(req.user.id);
    res.json(stats);
  } catch (err) { next(err); }
}

async function types(req, res, next) {
  try {
    const result = await assetService.getAssetTypes(req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { list, get, create, update, remove, dashboard, types, getAssetHistory };