const criteriaModel = require('../models/criteriaModel');
const { successResponse } = require('../utils/helpers');

const criteriaController = {
  async getAll(req, res, next) {
    try {
      const criteria = await criteriaModel.getAll();
      successResponse(res, criteria, 'Data kriteria berhasil dimuat');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const criteria = await criteriaModel.getById(req.params.id);
      if (!criteria) {
        const err = new Error('Kriteria tidak ditemukan');
        err.type = 'not_found';
        return next(err);
      }
      successResponse(res, criteria);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const criteria = await criteriaModel.create(req.body);
      successResponse(res, criteria, 'Kriteria berhasil ditambahkan', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const criteria = await criteriaModel.update(req.params.id, req.body);
      if (!criteria) {
        const err = new Error('Kriteria tidak ditemukan');
        err.type = 'not_found';
        return next(err);
      }
      successResponse(res, criteria, 'Kriteria berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const criteria = await criteriaModel.delete(req.params.id);
      if (!criteria) {
        const err = new Error('Kriteria tidak ditemukan');
        err.type = 'not_found';
        return next(err);
      }
      successResponse(res, criteria, 'Kriteria berhasil dihapus');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = criteriaController;
