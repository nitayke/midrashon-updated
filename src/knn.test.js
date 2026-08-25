import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateKNNMatches, PARAM_DEFINITIONS } from './knn.js';

const sampleMidrashot = [
  {
    id: 'm_test_1',
    name: 'אוריה - גבעת שמואל',
    type: 'service_combo',
    region: 'center',
    tracks: {
      before_service: false,
      after_service: false,
      before_army: false,
      service_combo: true,
      academic_combo: true
    },
    ratings: {
      halacha: 3,
      gemara: 1,
      rav_kook: 5,
      female_figures: 1,
      chassidut: 4,
      social: 5,
      personal_relation: 5,
      liberalism: 3,
      halacha_commitment: 4.5,
      conditions: 4,
      emunah: 3,
      tanach: 4,
      non_torah_activities: 1
    }
  },
  {
    id: 'm_test_2',
    name: 'בת ציון',
    type: 'service_combo',
    region: 'center',
    tracks: {
      before_service: false,
      after_service: false,
      before_army: false,
      service_combo: true,
      academic_combo: false
    },
    ratings: {
      halacha: 3,
      gemara: 1,
      rav_kook: 3,
      female_figures: 3,
      chassidut: 3,
      social: 4,
      personal_relation: 3,
      liberalism: 2,
      halacha_commitment: 4.5,
      conditions: 3.2,
      emunah: 3,
      tanach: 2,
      non_torah_activities: 1
    }
  }
];

test('Exact match returns 100% matchScore for identical midrasha parameters', () => {
  const targetMidrasha = sampleMidrashot[0];
  const userPreferences = {
    type: targetMidrasha.type,
    region: targetMidrasha.region,
    ratings: { ...targetMidrasha.ratings },
    ignoreParams: {}
  };

  const matches = calculateKNNMatches(userPreferences, sampleMidrashot, 3);
  
  assert.equal(matches.length > 0, true);
  assert.equal(matches[0].id, targetMidrasha.id);
  assert.equal(matches[0].matchScore, 100, 'Exact match must return 100% matchScore');
});

test('Distance increases and matchScore drops below 100% when ratings differ', () => {
  const userPreferences = {
    type: 'service_combo',
    region: 'center',
    ratings: {
      halacha: 5,
      gemara: 5,
      rav_kook: 1,
      female_figures: 5,
      chassidut: 1,
      social: 1,
      personal_relation: 1,
      liberalism: 5,
      halacha_commitment: 1,
      conditions: 1,
      emunah: 1,
      tanach: 1,
      non_torah_activities: 5
    },
    ignoreParams: {}
  };

  const matches = calculateKNNMatches(userPreferences, sampleMidrashot, 3);
  assert.equal(matches[0].matchScore < 100, true);
});

test('Ignored parameters are skipped without penalizing distance', () => {
  const targetMidrasha = sampleMidrashot[0];
  const ignoreParams = {};
  PARAM_DEFINITIONS.forEach(p => {
    ignoreParams[p.id] = true;
  });
  ignoreParams['rav_kook'] = false;

  const userPreferences = {
    type: targetMidrasha.type,
    region: targetMidrasha.region,
    ratings: { rav_kook: targetMidrasha.ratings.rav_kook },
    ignoreParams
  };

  const matches = calculateKNNMatches(userPreferences, sampleMidrashot, 3);
  assert.equal(matches[0].id, targetMidrasha.id);
  assert.equal(matches[0].matchScore, 100, 'Exact match on non-ignored parameter returns 100%');
});
