interface ServerJson {
    server_name: string;
    cpu_threshold: number;
    ram_threshold: number;
    disk_threshold: number;
    cpu_count_threshold: number;
    ram_count_threshold: number;
    disk_count_threshold: number;
    google_chat_webhooks: string[];
}