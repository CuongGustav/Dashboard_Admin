export interface Server{
    server_id: number;
    name: string;
    cpu_threshold: number;
    ram_threshold: number;
    disk_threshold: number;
    failure_threshold: number;
    cpu_count_threshold: number;
    ram_count_threshold: number;
    disk_count_threshold: number;
    channel: string;
    status: string;
    // created_at: Date;
    // updated_at: Date;
    created_at: string;
    updated_at: string;
}