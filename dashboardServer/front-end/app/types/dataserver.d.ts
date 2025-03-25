interface Data {
    cpu_history: string[];
    ram_history: string[];
    disk_history: string[];
    alert_sent: {
      cpu: boolean;
      ram: boolean;
      disk: boolean;
    };
    top_cpu_processes: Array<{ [key: string]: string }>;
    top_ram_processes: Array<{ [key: string]: string }>;
    threads: {
      cpu: string;
      ram: string;
      disk: string;
    };
    spaces: {
      cpu: string;
      ram: string;
      disk: string;
    };
    last_reported: string;
  }