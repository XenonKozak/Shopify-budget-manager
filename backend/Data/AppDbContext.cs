using Microsoft.EntityFrameworkCore;
using ShopifyBudgetManager.Api.Core.Models;

namespace ShopifyBudgetManager.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<BudgetLimit> BudgetLimits { get; set; }
        public DbSet<TransactionLog> TransactionLogs { get; set; }
        public DbSet<TransactionLogItem> TransactionLogItems { get; set; }
        public DbSet<GlobalSetting> GlobalSettings { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<ApprovalRequest> ApprovalRequests { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<BudgetLimit>()
                .HasIndex(b => b.Category)
                .IsUnique();
        }
    }
}
