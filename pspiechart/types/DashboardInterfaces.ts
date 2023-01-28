export interface DashboardStore {
  id?: number;
  name: string;
  dateCreated?: Date;
  dateModified?: Date;
  layout: any;
  panels: PanelStore[];
}

export enum PanelType {
  Text,
  Line,
  Button,
}

export interface PanelStore {
  id?: string;
  name: string;
  type: PanelType;
}
