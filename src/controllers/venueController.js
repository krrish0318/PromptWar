/**
 * Venue Controller
 * High-quality Class-based implementation for better organization and scalability.
 */

const { zones } = require('../data/venueData');
const navService = require('../services/navigationService');
const queueService = require('../services/queueService');
const googleService = require('../services/googleService');
const { AppError, catchAsync } = require('../utils/errors');
const { DENSITY_STATUS, HTTP_STATUS } = require('../utils/constants');

class VenueController {
  /**
   * Retrieves current crowd status for all monitored zones.
   */
  getCrowdStatus = catchAsync(async (req, res) => {
    const report = zones.map(z => ({
      id: z.id,
      name: z.name,
      density: z.density,
      status: z.density > 80 ? DENSITY_STATUS.HIGH : (z.density > 40 ? DENSITY_STATUS.MEDIUM : DENSITY_STATUS.LOW)
    }));
    
    res.status(HTTP_STATUS.OK).json(report);
  });

  /**
   * Generates wait-time predictions for all amenities.
   */
  getQueuePrediction = catchAsync(async (req, res) => {
    const report = queueService.getPredictionReport();
    res.status(HTTP_STATUS.OK).json(report);
  });

  /**
   * Calculates a crowd-optimized path between two zones.
   */
  getSmartRoute = catchAsync(async (req, res) => {
    const { from, to } = req.query;
    const result = navService.findSmartPath(from, to);
    
    if (!result) {
      throw new AppError('Path not found for specified zones', HTTP_STATUS.NOT_FOUND);
    }
    
    res.status(HTTP_STATUS.OK).json(result);
  });

  /**
   * Handles natural language inquiries via Gemini AI.
   */
  askAssistant = catchAsync(async (req, res) => {
    const result = await googleService.analyzeVenueNeeds(req.query.q);
    res.status(HTTP_STATUS.OK).json(result);
  });

  /**
   * Broadcasts a simulated emergency alert to all users.
   */
  triggerAlert = catchAsync(async (req, res) => {
    const alert = {
      title: "⚠️ Congestion Update",
      message: "Notice: Food Court is currently at max capacity (95%). Use East Concourse for quick transit.",
      affected: "food_court"
    };
    
    res.status(HTTP_STATUS.OK).json({ 
      status: "Alert Sent", 
      via: "Service Mock", 
      alert 
    });
  });

  /**
   * Administratively updates the crowd density of a specific zone.
   */
  updateDensity = catchAsync(async (req, res) => {
    const { zoneId, density } = req.body;
    const zone = zones.find(z => z.id === zoneId);
    
    if (!zone) {
      throw new AppError('Specified zone not found', HTTP_STATUS.NOT_FOUND);
    }
    
    zone.density = density;
    res.status(HTTP_STATUS.OK).json({ 
      success: true, 
      updatedZone: zone 
    });
  });
}

module.exports = new VenueController();
