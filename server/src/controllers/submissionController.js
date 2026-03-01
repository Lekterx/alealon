const submissionModel = require('../models/submissionModel');
const eventModel = require('../models/eventModel');
const { sendSubmissionStatus } = require('../services/emailService');

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function list(req, res, next) {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    const submissions = await submissionModel.findAll({ status, limit: parseInt(limit), offset: parseInt(offset) });
    res.json(submissions);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const submission = await submissionModel.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Soumission introuvable' });
    }
    res.json(submission);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const submission = await submissionModel.create({
      ...req.body,
      image_url: imageUrl,
      category_ids: req.body.category_ids || null,
    });
    res.status(201).json({ message: 'Événement soumis avec succès. Il sera examiné avant publication.', submission });
  } catch (err) {
    next(err);
  }
}

async function approve(req, res, next) {
  try {
    const submission = await submissionModel.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Soumission introuvable' });
    }

    const slug = slugify(submission.title) + '-' + Date.now().toString(36);
    const event = await eventModel.create({
      title: submission.title,
      slug,
      description: submission.description,
      date_start: submission.date_start,
      date_end: submission.date_end,
      address: submission.address,
      commune_id: submission.commune_id,
      image_url: submission.image_url,
      external_link: submission.external_link,
      price: submission.price,
      organizer: submission.organizer,
      contact_email: submission.contact_email,
      source: 'submission',
      status: 'published',
      featured: false,
    });

    if (submission.category_ids) {
      const ids = Array.isArray(submission.category_ids) ? submission.category_ids : JSON.parse(submission.category_ids);
      await eventModel.setCategories(event.id, ids.map(Number));
    }

    await submissionModel.updateStatus(submission.id, 'approved', null);

    if (submission.submitter_email) {
      await sendSubmissionStatus({ email: submission.submitter_email, eventTitle: submission.title, status: 'published' });
    }

    res.json({ message: 'Événement approuvé et publié', event });
  } catch (err) {
    next(err);
  }
}

async function reject(req, res, next) {
  try {
    const submission = await submissionModel.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Soumission introuvable' });
    }

    await submissionModel.updateStatus(submission.id, 'rejected', req.body.reason);

    if (submission.submitter_email) {
      await sendSubmissionStatus({ email: submission.submitter_email, eventTitle: submission.title, status: 'rejected', reason: req.body.reason });
    }

    res.json({ message: 'Soumission rejetée' });
  } catch (err) {
    next(err);
  }
}

async function stats(req, res, next) {
  try {
    const counts = await submissionModel.countByStatus();
    res.json(counts);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, approve, reject, stats };
