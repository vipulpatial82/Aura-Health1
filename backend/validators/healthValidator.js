import { z } from 'zod';

const num = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
  z.number().optional()
);

const str = z.string().optional();

export const healthDataSchema = z.object({
  personalInfo: z.object({
    fullName:    str,
    age:         num,
    bloodGroup:  str,
    weight:      num,
    height:      num,
  }),
  medicalInfo: z.object({
    diabetes:          num,
    hba1c:             num,
    systolicBP:        num,
    diastolicBP:       num,
    restingHeartRate:  num,
    oxygenSaturation:  num,
    totalCholesterol:  num,
    ldlCholesterol:    num,
    hdlCholesterol:    num,
    triglycerides:     num,
    additionalNotes:   str,
  }),
});
