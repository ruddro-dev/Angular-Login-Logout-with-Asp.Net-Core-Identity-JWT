using AuthAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AuthAPI.Extensions
{
    public static class EFCoreExtentions
    {
        public static IServiceCollection InjectDbContext(this IServiceCollection services, IConfiguration config)
        {

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(config.GetConnectionString("DefaultConnection")));
            return services;
        }
    }
}
