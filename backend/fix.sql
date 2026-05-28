USE ShopifyBudgetManagerDb;
GO

UPDATE TransactionLogs SET Reason = N'Przekroczono limit budżetu. Zamówienie powoduje wydatki 2100.00 (Limit: 2000.00)' WHERE Id = 4;

UPDATE Notifications SET Title = N'Zbliżasz się do limitu!', Message = N'Kategoria "Elektronika" osiągnęła 80% limitu (3200.00 / 4000.00 PLN).' WHERE Id = 1;
UPDATE Notifications SET Title = N'Budżet przekroczony!', Message = N'Zamówienie #1004 na kwotę 2100.00 PLN przekroczyło limit kategorii "Marketing". Wymaga zatwierdzenia administratora.' WHERE Id = 2;

UPDATE ApprovalRequests SET DecisionNote = N'Pilny zakup sprzętu biurowego.' WHERE Id = 2;

UPDATE AuditLogs SET Details = N'Zamówienie #1000 (500.00 PLN) — decyzja: Approved. Pilny zakup sprzętu biurowego.' WHERE Action = 'ApprovalDecision:Approved';

UPDATE BudgetLimits SET Name = N'Elektronika' WHERE Category = 'electronics';
UPDATE BudgetLimits SET Name = N'Biuro' WHERE Category = 'office';

UPDATE TransactionLogItems SET Name = N'Monitor 4K' WHERE Name LIKE 'Monitor%';
UPDATE TransactionLogItems SET Name = N'Fotel biurowy' WHERE Name LIKE 'Fotel%';
UPDATE TransactionLogItems SET Name = N'Smartfon' WHERE Name LIKE 'Smartfon%';
UPDATE TransactionLogItems SET Name = N'Kampania Ads' WHERE Name LIKE 'Kampania%';
GO
