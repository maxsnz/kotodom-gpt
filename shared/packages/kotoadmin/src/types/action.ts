export type Action = {
  name: string;
  action: (record: any) => void | Promise<void>;
  available: (record: any) => boolean;
  icon: React.ReactNode;
};
