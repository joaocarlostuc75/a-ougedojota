import { NhostClient } from '@nhost/react';

const subdomain = import.meta.env.VITE_NHOST_SUBDOMAIN || 'local';
const region = import.meta.env.VITE_NHOST_REGION || 'local';

export const nhost = new NhostClient({
  subdomain,
  region,
});
