export type AuthenticatedStackParamList = {
  TabsMain: undefined
  LeadDetails: { leadId: string } | undefined
  CreateLead: undefined
  OfferDetails: { offer: any } | undefined
  CreateAssociate: { associateId?: string } | undefined
  EditAssociate: { associateId?: string } | undefined
  Team: undefined
  Profile: undefined
  Support: undefined
  ProductInfo: undefined
}
