---
title: "How to Manage User Access to Inbounds?"
description: "This article describes a mechanism for managing access to inbounds using the exclude_inbounds_association table, allowing flexible enabling and disabling of access for individual user groups or for everyone at once."
tags:
  - SQL
  - Database
  - Access Control
  - Inbound
series: "MarzbanGuide"
draft: false
pubDate: 07 02 2025
email: "dignezzz@gmail.com"
---

# How to Manage User Access to Inbounds? 🤔

In the database, there is a table called **exclude_inbounds_association** that is responsible for prohibiting the use of certain inbounds by users. If there is an entry for a specific user and inbound, access to that inbound is **denied**. If there is no entry, access is granted.

In this article, we will demonstrate how this table can be used to:

- Disable an inbound for users of a specific administrator.
- Disable an inbound for all users.
- Enable an inbound for users of a specific administrator.
- Enable an inbound for all users.

---

## Disabling an Inbound for Users of a Specific Administrator

Suppose you need to prohibit the use of **INBOUND_NAME** for all users of an administrator with the username **ADMIN**. To achieve this, you insert records into the `exclude_inbounds_association` table that associate the proxy IDs of the users of that administrator with the specified inbound:

```sql
INSERT INTO exclude_inbounds_association (proxy_id, inbound_tag)
SELECT proxies.id, "INBOUND_NAME"
FROM users
INNER JOIN admins ON users.admin_id = admins.id
INNER JOIN proxies ON proxies.user_id = users.id
WHERE admins.username = "ADMIN";
```

After executing this query, the users of the **ADMIN** administrator will no longer be able to use the **INBOUND_NAME** inbound.

---

## Disabling an Inbound for All Users

If you need to block the **INBOUND_NAME** inbound for all users, regardless of the administrator, execute the following query:

```sql
INSERT INTO exclude_inbounds_association (proxy_id, inbound_tag)
SELECT proxies.id, "INBOUND_NAME"
FROM users
INNER JOIN admins ON users.admin_id = admins.id
INNER JOIN proxies ON proxies.user_id = users.id;
```

After this query is executed, the specified inbound will become inaccessible to all users.

---

## Enabling an Inbound for Users of a Specific Administrator

To allow the use of **INBOUND_NAME** once again for the users of the **ADMIN** administrator, remove the corresponding records from the table:

```sql
DELETE FROM exclude_inbounds_association 
WHERE proxy_id IN (
    SELECT proxies.id
    FROM users
    INNER JOIN admins ON users.admin_id = admins.id
    INNER JOIN proxies ON proxies.user_id = users.id
    WHERE admins.username = 'ADMIN'
) AND inbound_tag = 'INBOUND_NAME';
```

After running this query, the users of the **ADMIN** administrator will be able to access the **INBOUND_NAME** inbound again.

---

## Enabling an Inbound for All Users

To restore access to the **INBOUND_NAME** inbound for all users, simply remove the entries for that inbound without filtering by administrator:

```sql
DELETE FROM exclude_inbounds_association 
WHERE proxy_id IN (
    SELECT proxies.id
    FROM users
    INNER JOIN admins ON users.admin_id = admins.id
    INNER JOIN proxies ON proxies.user_id = users.id
) AND inbound_tag = 'INBOUND_NAME';
```

After this query is executed, access to the **INBOUND_NAME** inbound will be restored for all users.

---

## Conclusion

The **exclude_inbounds_association** table is a convenient tool for flexible management of access to inbounds. By adding or removing records from this table, you can quickly disable or enable inbounds for users of a specific administrator as well as for all users simultaneously.
