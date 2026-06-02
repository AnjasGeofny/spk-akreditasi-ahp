const alternativeModel = require('../models/alternativeModel');
const { successResponse } = require('../utils/helpers');

const alternativeController = {
  async getAll(req, res, next) {
    try {
      const alternatives = await alternativeModel.getAll();
      successResponse(res, alternatives, 'Data alternatif berhasil dimuat');
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const alternative = await alternativeModel.getById(req.params.id);
      if (!alternative) {
        const err = new Error('Alternatif tidak ditemukan');
        err.type = 'not_found';
        return next(err);
      }
      successResponse(res, alternative);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const alternative = await alternativeModel.create(req.body);
      successResponse(res, alternative, 'Alternatif berhasil ditambahkan', 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const alternative = await alternativeModel.update(req.params.id, req.body);
      if (!alternative) {
        const err = new Error('Alternatif tidak ditemukan');
        err.type = 'not_found';
        return next(err);
      }
      successResponse(res, alternative, 'Alternatif berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const alternative = await alternativeModel.delete(req.params.id);
      if (!alternative) {
        const err = new Error('Alternatif tidak ditemukan');
        err.type = 'not_found';
        return next(err);
      }
      successResponse(res, alternative, 'Alternatif berhasil dihapus');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = alternativeController;
