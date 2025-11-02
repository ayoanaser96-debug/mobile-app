import { Injectable, NotFoundException, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Prescription, PrescriptionDocument } from './schemas/prescription.schema';
import { PrescriptionTemplate, PrescriptionTemplateDocument } from './schemas/prescription-template.schema';
import { PatientJourneyService } from '../patients/patient-journey.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectModel(Prescription.name)
    private prescriptionModel: Model<PrescriptionDocument>,
    @InjectModel(PrescriptionTemplate.name)
    private templateModel: Model<PrescriptionTemplateDocument>,
    @Optional() @Inject(forwardRef(() => PatientJourneyService))
    private patientJourneyService?: PatientJourneyService,
  ) {}

  async create(createDto: any) {
    const prescription = new this.prescriptionModel(createDto);
    return prescription.save();
  }

  async findByPatient(patientId: string) {
    return this.prescriptionModel
      .find({ patientId })
      .populate('doctorId', 'firstName lastName specialty')
      .populate('pharmacyId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async findByDoctor(doctorId: string) {
    return this.prescriptionModel
      .find({ doctorId })
      .populate('patientId', 'firstName lastName')
      .populate('pharmacyId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async findById(id: string) {
    const prescription = await this.prescriptionModel
      .findById(id)
      .populate('patientId')
      .populate('doctorId')
      .populate('pharmacyId');
    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }
    return prescription;
  }

  async update(id: string, updateDto: any) {
    return this.prescriptionModel.findByIdAndUpdate(id, updateDto, { new: true });
  }

  async assignToPharmacy(id: string, pharmacyId: string) {
    return this.prescriptionModel.findByIdAndUpdate(
      id,
      { pharmacyId, status: 'pending' },
      { new: true },
    );
  }

  async fillPrescription(id: string, notes?: string) {
    const updated = await this.prescriptionModel.findByIdAndUpdate(
      id,
      { status: 'filled', pharmacyNotes: notes },
      { new: true },
    ).populate('patientId');
    
    // Update patient journey - mark pharmacy step as complete
    if (this.patientJourneyService && updated?.patientId) {
      try {
        const patientId = typeof updated.patientId === 'string' 
          ? updated.patientId 
          : (updated.patientId as any)?._id?.toString() || (updated.patientId as any)?.id?.toString();
        if (patientId) {
          await this.patientJourneyService.markPharmacyComplete(patientId, undefined, id);
        }
      } catch (error) {
        // Journey might not exist, that's okay
        console.log('Journey update skipped:', error.message);
      }
    }
    
    return updated;
  }

  async getAISuggestions(diagnosis: string, patientHistory?: any) {
    // AI-based prescription suggestions
    const suggestions: any[] = [];

    if (diagnosis.toLowerCase().includes('cataract')) {
      suggestions.push({
        medications: [
          {
            name: 'Artificial Tears',
            dosage: '1-2 drops',
            frequency: '4 times daily',
            duration: '2-4 weeks',
            instructions: 'Use as needed for dryness',
          },
        ],
        glasses: [
          {
            type: 'glasses',
            prescription: {
              sphere: patientHistory?.refraction?.sphere || '0.00',
              cylinder: patientHistory?.refraction?.cylinder || '0.00',
              axis: patientHistory?.refraction?.axis || '0',
            },
            lensType: 'Anti-reflective',
          },
        ],
        notes: 'Post-cataract surgery care. Monitor for inflammation.',
      });
    }

    if (diagnosis.toLowerCase().includes('glaucoma')) {
      suggestions.push({
        medications: [
          {
            name: 'Timolol Eye Drops',
            dosage: '1 drop',
            frequency: 'Twice daily',
            duration: 'Ongoing',
            instructions: 'Apply to affected eye(s). Monitor IOP regularly.',
          },
        ],
        notes: 'Regular IOP monitoring required. Follow-up in 3 months.',
      });
    }

    if (diagnosis.toLowerCase().includes('diabetic retinopathy')) {
      suggestions.push({
        medications: [
          {
            name: 'Lucentis (Ranibizumab)',
            dosage: '0.5mg',
            frequency: 'Monthly injections',
            duration: '3-6 months',
            instructions: 'Intravitreal injection by specialist',
          },
        ],
        notes: 'Requires specialist ophthalmologist consultation. Strict blood sugar control essential.',
      });
    }

    if (diagnosis.toLowerCase().includes('myopia') || diagnosis.toLowerCase().includes('nearsighted')) {
      suggestions.push({
        glasses: [
          {
            type: 'glasses',
            prescription: {
              sphere: patientHistory?.refraction?.sphere || '-2.00',
              cylinder: patientHistory?.refraction?.cylinder || '0.00',
              axis: patientHistory?.refraction?.axis || '0',
            },
            lensType: 'Single Vision',
          },
        ],
        notes: 'Regular vision check recommended annually.',
      });
    }

    return suggestions;
  }

  async getTemplates(specialty?: string) {
    try {
      const query = specialty ? { specialty } : {};
      let templates = await this.templateModel.find(query).sort({ name: 1 });
      
      // If no templates exist, create default templates
      if (templates.length === 0) {
        try {
          await this.createDefaultTemplates();
          templates = await this.templateModel.find(query).sort({ name: 1 });
        } catch (error) {
          console.error('Error creating default templates:', error);
          // Return empty array if default templates fail to create
          return [];
        }
      }
      
      return templates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  private async createDefaultTemplates() {
    const defaultTemplates = [
      // Medication Templates
      {
        name: 'Dry Eye Treatment',
        specialty: 'General Ophthalmology',
        medications: [
          {
            name: 'Artificial Tears',
            dosage: '1-2 drops',
            frequency: '4 times daily',
            duration: '4-6 weeks',
            instructions: 'Apply in each eye as needed for dryness',
          },
          {
            name: 'Cyclosporine Eye Drops',
            dosage: '1 drop',
            frequency: 'Twice daily',
            duration: '3-6 months',
            instructions: 'Apply before bedtime',
          },
        ],
        notes: 'Treat dry eye syndrome. Monitor for improvement after 2-4 weeks.',
      },
      {
        name: 'Glaucoma Management',
        specialty: 'Glaucoma',
        medications: [
          {
            name: 'Timolol Eye Drops',
            dosage: '1 drop',
            frequency: 'Twice daily',
            duration: 'Ongoing',
            instructions: 'Apply to affected eye(s). Monitor IOP regularly.',
          },
        ],
        notes: 'Regular IOP monitoring required. Follow-up in 3 months.',
      },
      {
        name: 'Eye Infection Treatment',
        specialty: 'General Ophthalmology',
        medications: [
          {
            name: 'Chloramphenicol Eye Drops',
            dosage: '1-2 drops',
            frequency: '4 times daily',
            duration: '7-10 days',
            instructions: 'Apply to infected eye. Wash hands before application.',
          },
          {
            name: 'Chloramphenicol Eye Ointment',
            dosage: 'Small amount',
            frequency: 'At bedtime',
            duration: '7-10 days',
            instructions: 'Apply before sleep for better coverage.',
          },
        ],
        notes: 'Complete full course even if symptoms improve. Avoid contact lenses during treatment.',
      },
      {
        name: 'Allergic Conjunctivitis',
        specialty: 'General Ophthalmology',
        medications: [
          {
            name: 'Antihistamine Eye Drops',
            dosage: '1-2 drops',
            frequency: 'Twice daily',
            duration: '2-4 weeks',
            instructions: 'Apply as needed for allergy symptoms',
          },
          {
            name: 'Artificial Tears',
            dosage: '1-2 drops',
            frequency: 'As needed',
            duration: 'As needed',
            instructions: 'Use to flush allergens',
          },
        ],
        notes: 'Avoid allergens. Cool compress may help reduce irritation.',
      },
      // Glasses Templates
      {
        name: 'Single Vision Glasses',
        specialty: 'Refractive Error',
        glasses: [
          {
            type: 'glasses',
            prescription: {
              sphere: '-2.00',
              cylinder: '0.00',
              axis: '0',
            },
            lensType: 'Single Vision',
            frame: 'Standard Frame',
          },
        ],
        notes: 'Standard single vision correction. Update prescription annually.',
      },
      {
        name: 'Progressive Lenses',
        specialty: 'Presbyopia',
        glasses: [
          {
            type: 'glasses',
            prescription: {
              sphere: '0.00',
              cylinder: '0.00',
              axis: '0',
              add: '+2.50',
            },
            lensType: 'Progressive',
            frame: 'Full Frame Recommended',
          },
        ],
        notes: 'Progressive lenses for presbyopia. Allow 1-2 weeks adaptation period.',
      },
      {
        name: 'Bifocal Glasses',
        specialty: 'Presbyopia',
        glasses: [
          {
            type: 'glasses',
            prescription: {
              sphere: '0.00',
              cylinder: '0.00',
              axis: '0',
              add: '+2.50',
            },
            lensType: 'Bifocal',
            frame: 'Standard Frame',
          },
        ],
        notes: 'Bifocal correction for near and distance vision.',
      },
      {
        name: 'Astigmatism Correction',
        specialty: 'Refractive Error',
        glasses: [
          {
            type: 'glasses',
            prescription: {
              sphere: '-2.00',
              cylinder: '-1.50',
              axis: '90',
            },
            lensType: 'Single Vision',
            frame: 'Standard Frame',
          },
        ],
        notes: 'Astigmatism correction. Ensure proper axis alignment.',
      },
      {
        name: 'Contact Lenses - Daily',
        specialty: 'Refractive Error',
        glasses: [
          {
            type: 'contact_lenses',
            prescription: {
              sphere: '-2.00',
              cylinder: '0.00',
              axis: '0',
            },
            lensType: 'Daily Disposable',
          },
        ],
        notes: 'Daily disposable contact lenses. Replace daily. Follow hygiene guidelines.',
      },
      {
        name: 'Contact Lenses - Monthly',
        specialty: 'Refractive Error',
        glasses: [
          {
            type: 'contact_lenses',
            prescription: {
              sphere: '-2.00',
              cylinder: '-0.75',
              axis: '180',
            },
            lensType: 'Monthly',
          },
        ],
        notes: 'Monthly contact lenses. Clean daily. Replace monthly or as recommended.',
      },
    ];

    try {
      for (const template of defaultTemplates) {
        try {
          const existing = await this.templateModel.findOne({ name: template.name });
          if (!existing) {
            await this.templateModel.create(template);
          }
        } catch (error) {
          console.error(`Error creating template "${template.name}":`, error);
          // Continue with next template if one fails
        }
      }
    } catch (error) {
      console.error('Error in createDefaultTemplates:', error);
      throw error;
    }
  }

  async createTemplate(templateData: any) {
    try {
      const template = new this.templateModel(templateData);
      return await template.save();
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  async getTemplateById(id: string) {
    const template = await this.templateModel.findById(id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async signPrescription(id: string, signature: string, doctorId: string) {
    return this.prescriptionModel.findByIdAndUpdate(
      id,
      {
        $set: {
          'metadata.digitalSignature': signature,
          'metadata.signedBy': doctorId,
          'metadata.signedAt': new Date(),
        },
      },
      { new: true },
    );
  }
}

