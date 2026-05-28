USE ShopifyBudgetManagerDb;
GO

-- 1. Ustawienie budżetu globalnego
IF NOT EXISTS (SELECT * FROM GlobalSettings WHERE [Key] = 'TotalMonthlyBudget')
BEGIN
    INSERT INTO GlobalSettings ([Key], [Value]) VALUES ('TotalMonthlyBudget', '10000.00');
END
ELSE
BEGIN
    UPDATE GlobalSettings SET [Value] = '10000.00' WHERE [Key] = 'TotalMonthlyBudget';
END
GO

-- 2. Limity budżetowe
IF NOT EXISTS (SELECT * FROM BudgetLimits WHERE Category = 'electronics')
BEGIN
    INSERT INTO BudgetLimits (Name, Category, MonthlyLimit, CurrentSpent, Currency, IsActive, CreatedAt, UpdatedAt)
    VALUES ('Elektronika', 'electronics', 4000.00, 3200.00, 'PLN', 1, GETUTCDATE(), GETUTCDATE());
END

IF NOT EXISTS (SELECT * FROM BudgetLimits WHERE Category = 'marketing')
BEGIN
    INSERT INTO BudgetLimits (Name, Category, MonthlyLimit, CurrentSpent, Currency, IsActive, CreatedAt, UpdatedAt)
    VALUES ('Marketing', 'marketing', 2000.00, 2100.00, 'PLN', 1, GETUTCDATE(), GETUTCDATE());
END

IF NOT EXISTS (SELECT * FROM BudgetLimits WHERE Category = 'office')
BEGIN
    INSERT INTO BudgetLimits (Name, Category, MonthlyLimit, CurrentSpent, Currency, IsActive, CreatedAt, UpdatedAt)
    VALUES ('Biuro', 'office', 1000.00, 450.00, 'PLN', 1, GETUTCDATE(), GETUTCDATE());
END
GO

-- 3. Transakcje (TransactionLogs i Items)
DECLARE @Today DATETIME = GETUTCDATE();
DECLARE @Yesterday DATETIME = DATEADD(day, -1, @Today);
DECLARE @TwoDaysAgo DATETIME = DATEADD(day, -2, @Today);
DECLARE @ThreeDaysAgo DATETIME = DATEADD(day, -3, @Today);

IF NOT EXISTS (SELECT * FROM TransactionLogs WHERE OrderId = '1001')
BEGIN
    INSERT INTO TransactionLogs (OrderId, OrderName, Category, Amount, Currency, Status, Reason, CreatedAt, UpdatedAt)
    VALUES ('1001', '#1001', 'electronics', 1500.00, 'PLN', 'ALLOWED', NULL, @ThreeDaysAgo, @ThreeDaysAgo);
    
    DECLARE @LogId1 INT = SCOPE_IDENTITY();
    
    INSERT INTO TransactionLogItems (TransactionLogId, Name, Quantity, Price, ProductId, ProductUrl)
    VALUES (@LogId1, 'Monitor 4K', 1, 1500.00, 'prod1', 'https://shop.com/prod1');
END

IF NOT EXISTS (SELECT * FROM TransactionLogs WHERE OrderId = '1002')
BEGIN
    INSERT INTO TransactionLogs (OrderId, OrderName, Category, Amount, Currency, Status, Reason, CreatedAt, UpdatedAt)
    VALUES ('1002', '#1002', 'office', 450.00, 'PLN', 'ALLOWED', NULL, @TwoDaysAgo, @TwoDaysAgo);
    
    DECLARE @LogId2 INT = SCOPE_IDENTITY();
    
    INSERT INTO TransactionLogItems (TransactionLogId, Name, Quantity, Price, ProductId, ProductUrl)
    VALUES (@LogId2, 'Fotel biurowy', 1, 450.00, 'prod2', 'https://shop.com/prod2');
END

IF NOT EXISTS (SELECT * FROM TransactionLogs WHERE OrderId = '1003')
BEGIN
    INSERT INTO TransactionLogs (OrderId, OrderName, Category, Amount, Currency, Status, Reason, CreatedAt, UpdatedAt)
    VALUES ('1003', '#1003', 'electronics', 1700.00, 'PLN', 'ALLOWED', NULL, @Yesterday, @Yesterday);
    
    DECLARE @LogId3 INT = SCOPE_IDENTITY();
    
    INSERT INTO TransactionLogItems (TransactionLogId, Name, Quantity, Price, ProductId, ProductUrl)
    VALUES (@LogId3, 'Smartfon', 1, 1700.00, 'prod3', 'https://shop.com/prod3');
END

IF NOT EXISTS (SELECT * FROM TransactionLogs WHERE OrderId = '1004')
BEGIN
    INSERT INTO TransactionLogs (OrderId, OrderName, Category, Amount, Currency, Status, Reason, CreatedAt, UpdatedAt)
    VALUES ('1004', '#1004', 'marketing', 2100.00, 'PLN', 'BLOCKED', 'Przekroczono limit budżetu. Zamówienie powoduje wydatki 2100.00 (Limit: 2000.00)', @Today, @Today);
    
    DECLARE @LogId4 INT = SCOPE_IDENTITY();
    
    INSERT INTO TransactionLogItems (TransactionLogId, Name, Quantity, Price, ProductId, ProductUrl)
    VALUES (@LogId4, 'Kampania Ads', 1, 2100.00, 'prod4', 'https://shop.com/prod4');
END
GO

-- 4. Approval Requests
IF NOT EXISTS (SELECT * FROM ApprovalRequests WHERE OrderId = '1004')
BEGIN
    INSERT INTO ApprovalRequests (OrderId, OrderName, Amount, Currency, Category, Status, CreatedAt)
    VALUES ('1004', '#1004', 2100.00, 'PLN', 'marketing', 'Pending', GETUTCDATE());
END

IF NOT EXISTS (SELECT * FROM ApprovalRequests WHERE OrderId = '1000')
BEGIN
    INSERT INTO ApprovalRequests (OrderId, OrderName, Amount, Currency, Category, Status, DecisionNote, CreatedAt, DecidedAt)
    VALUES ('1000', '#1000', 500.00, 'PLN', 'office', 'Approved', 'Pilny zakup sprzętu biurowego.', DATEADD(day, -4, GETUTCDATE()), DATEADD(day, -3, GETUTCDATE()));
END
GO

-- 5. Powiadomienia
IF NOT EXISTS (SELECT * FROM Notifications WHERE Title LIKE 'Zbliżasz się do limitu%')
BEGIN
    INSERT INTO Notifications (Title, Message, Type, IsRead, CreatedAt)
    VALUES ('Zbliżasz się do limitu!', 'Kategoria "Elektronika" osiągnęła 80% limitu (3200.00 / 4000.00 PLN).', 'BudgetWarning', 0, DATEADD(hour, -2, GETUTCDATE()));
END

IF NOT EXISTS (SELECT * FROM Notifications WHERE Title LIKE 'Budżet przekroczony%')
BEGIN
    INSERT INTO Notifications (Title, Message, Type, IsRead, CreatedAt)
    VALUES ('Budżet przekroczony!', 'Zamówienie #1004 na kwotę 2100.00 PLN przekroczyło limit kategorii "Marketing". Wymaga zatwierdzenia administratora.', 'BudgetExceeded', 0, DATEADD(hour, -1, GETUTCDATE()));
END
GO

-- 6. Audit Logs
IF NOT EXISTS (SELECT * FROM AuditLogs WHERE Details LIKE '%#1001%')
BEGIN
    INSERT INTO AuditLogs (Action, EntityType, EntityId, Details, CreatedAt)
    VALUES ('WebhookReceived', 'Order', '1001', 'Odebrano webhook dla zamówienia #1001, kwota: 1500.00 PLN', DATEADD(day, -3, GETUTCDATE()));
END

IF NOT EXISTS (SELECT * FROM AuditLogs WHERE Details LIKE '%#1002%')
BEGIN
    INSERT INTO AuditLogs (Action, EntityType, EntityId, Details, CreatedAt)
    VALUES ('WebhookReceived', 'Order', '1002', 'Odebrano webhook dla zamówienia #1002, kwota: 450.00 PLN', DATEADD(day, -2, GETUTCDATE()));
END

IF NOT EXISTS (SELECT * FROM AuditLogs WHERE Details LIKE '%#1003%')
BEGIN
    INSERT INTO AuditLogs (Action, EntityType, EntityId, Details, CreatedAt)
    VALUES ('WebhookReceived', 'Order', '1003', 'Odebrano webhook dla zamówienia #1003, kwota: 1700.00 PLN', DATEADD(day, -1, GETUTCDATE()));
END

IF NOT EXISTS (SELECT * FROM AuditLogs WHERE Details LIKE '%#1004%')
BEGIN
    INSERT INTO AuditLogs (Action, EntityType, EntityId, Details, CreatedAt)
    VALUES ('WebhookReceived', 'Order', '1004', 'Odebrano webhook dla zamówienia #1004, kwota: 2100.00 PLN', GETUTCDATE());
END

IF NOT EXISTS (SELECT * FROM AuditLogs WHERE Details LIKE '%Pilny zakup sprzętu%')
BEGIN
    INSERT INTO AuditLogs (Action, EntityType, EntityId, Details, CreatedAt)
    VALUES ('ApprovalDecision:Approved', 'ApprovalRequest', '1', 'Zamówienie #1000 (500.00 PLN) — decyzja: Approved. Pilny zakup sprzętu biurowego.', DATEADD(day, -3, GETUTCDATE()));
END
GO
