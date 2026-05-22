// ========== SAYFA KAYITLARI ==========

// Müşteri sayfaları
registerPage('customerDashboard', () => renderCustomerDashboard());
registerPage('vehicleSearch', () => renderVehicleSearch());
registerPage('myReservations', () => renderMyReservations());
registerPage('myNotifications', () => renderMyNotifications());
registerPage('myProfile', () => renderMyProfile());

// Personel sayfaları
registerPage('empDashboard', () => renderEmpDashboard());
registerPage('empReservations', () => renderEmpReservations());
registerPage('empVehicles', () => renderEmpVehicles());
registerPage('empCustomers', () => renderEmpCustomers());
registerPage('empDamage', () => renderEmpDamage());

// Admin sayfaları
registerPage('adminDashboard', () => renderAdminDashboard());
registerPage('adminVehicles', () => renderAdminVehicles());
registerPage('adminBranches', () => renderAdminBranches());
registerPage('adminEmployees', () => renderAdminEmployees());
registerPage('adminCustomers', () => renderAdminCustomers());
registerPage('adminReservations', () => renderAdminReservations());
registerPage('adminPayments', () => renderAdminPayments());
registerPage('adminReports', () => renderAdminReports());
registerPage('adminCampaigns', () => renderAdminCampaigns());
registerPage('adminDatabase', () => renderAdminDatabase());

// ========== BAŞLAT ==========
document.addEventListener('DOMContentLoaded', initApp);
