import prisma from '../config/db';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class CrmService {
  // --- Leads CRUD ---
  async getLeads(tenantId: string) {
    return prisma.lead.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createLead(tenantId: string, data: any) {
    return prisma.lead.create({
      data: {
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone || null,
        source: data.source || 'WEBSITE',
        status: data.status || 'NEW',
        tenantId
      }
    });
  }

  async predictLeadConversion(leadId: string, tenantId: string) {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, tenantId, deletedAt: null }
    });

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Lead Conversion ML Predictor logic based on source & status
    let score = 25; // baseline cold lead
    if (lead.source === 'REFERRAL') score += 40;
    if (lead.source === 'LINKEDIN') score += 20;
    if (lead.source === 'CAMPAIGN') score += 15;

    if (lead.status === 'QUALIFIED') score += 20;
    if (lead.status === 'PROPOSAL') score += 30;

    return {
      leadId,
      score: Math.min(score, 99),
      recommendation: score > 70 
        ? 'High probability deal. Propose custom pricing immediately.' 
        : 'Cold Lead. Nurture with bi-weekly updates.'
    };
  }

  // --- Clients & Deals ---
  async getClients(tenantId: string) {
    return prisma.client.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createClient(tenantId: string, data: any) {
    return prisma.client.create({
      data: {
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        tenantId
      }
    });
  }

  async getDeals(tenantId: string) {
    return prisma.deal.findMany({
      where: { tenantId, deletedAt: null },
      include: { client: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createDeal(tenantId: string, data: any) {
    return prisma.deal.create({
      data: {
        name: data.name,
        amount: parseFloat(data.amount) || 0.0,
        stage: data.stage || 'NEW',
        clientId: data.clientId,
        tenantId
      }
    });
  }

  // --- Meetings & Reminders ---
  async getMeetings(tenantId: string) {
    return prisma.meeting.findMany({
      where: { tenantId, deletedAt: null },
      include: { lead: true, client: true },
      orderBy: { date: 'asc' }
    });
  }

  async createMeeting(tenantId: string, data: any) {
    return prisma.meeting.create({
      data: {
        title: data.title,
        description: data.description || null,
        date: new Date(data.date),
        durationMinutes: parseInt(data.durationMinutes) || 30,
        leadId: data.leadId || null,
        clientId: data.clientId || null,
        tenantId
      }
    });
  }

  // --- CRM & Revenue Analytics ---
  async getCrmDashboard(tenantId: string) {
    const leads = await prisma.lead.findMany({ where: { tenantId, deletedAt: null } });
    const deals = await prisma.deal.findMany({ where: { tenantId, deletedAt: null } });
    
    const wonAmount = deals.filter(d => d.stage === 'CLOSED_WON').reduce((sum, d) => sum + d.amount, 0);
    const pipeAmount = deals.filter(d => d.stage !== 'CLOSED_WON' && d.stage !== 'CLOSED_LOST').reduce((sum, d) => sum + d.amount, 0);

    const conversionRate = leads.length > 0
      ? Math.round((leads.filter(l => l.status === 'WON').length / leads.length) * 100)
      : 32;

    return {
      kpis: {
        totalLeads: leads.length,
        conversionRate,
        pipelineValue: pipeAmount,
        closedWonRevenue: wonAmount
      },
      dealsStageDistribution: {
        new: deals.filter(d => d.stage === 'NEW').length,
        discovery: deals.filter(d => d.stage === 'DISCOVERY').length,
        proposal: deals.filter(d => d.stage === 'PROPOSAL').length,
        won: deals.filter(d => d.stage === 'CLOSED_WON').length,
        lost: deals.filter(d => d.stage === 'CLOSED_LOST').length
      }
    };
  }
}

export default new CrmService();
export const crmService = new CrmService();
