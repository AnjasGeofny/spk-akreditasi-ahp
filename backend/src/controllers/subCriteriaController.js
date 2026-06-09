const subCriteriaModel = require('../models/subCriteriaModel');
const { successResponse } = require('../utils/helpers');

const subCriteriaController = {
  async getAll(req, res, next) {
    try {
      const subCriteria = await subCriteriaModel.getAll(req.query.criteria_id);
      successResponse(res, subCriteria, 'Data sub-kriteria berhasil dimuat');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const subCriteria = await subCriteriaModel.getById(req.params.id);
      if (!subCriteria) {
        const err = new Error('Sub-kriteria tidak ditemukan');
        err.type = 'not_found';
        return next(err);
      }
      successResponse(res, subCriteria);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const subCriteria = await subCriteriaModel.create(req.body);
      successResponse(res, subCriteria, 'Sub-kriteria berhasil ditambahkan', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const subCriteria = await subCriteriaModel.update(req.params.id, req.body);
      if (!subCriteria) {
        const err = new Error('Sub-kriteria tidak ditemukan');
        err.type = 'not_found';
        return next(err);
      }
      successResponse(res, subCriteria, 'Sub-kriteria berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const subCriteria = await subCriteriaModel.delete(req.params.id);
      if (!subCriteria) {
        const err = new Error('Sub-kriteria tidak ditemukan');
        err.type = 'not_found';
        return next(err);
      }
      successResponse(res, subCriteria, 'Sub-kriteria berhasil dihapus');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = subCriteriaController;
