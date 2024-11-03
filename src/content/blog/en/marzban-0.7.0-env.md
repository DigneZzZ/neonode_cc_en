---
title: New .env Variables for Marzban Optimization
description: This guide describes new environment variables added to Marzban to enhance performance, especially for high user loads.
tags:
  - Marzban
  - configuration
  - variables
series: MarzbanGuide
draft: false
pubDate: 11 03 2024
---

The latest Marzban version includes several useful environment variables in the `.env` file, which are particularly beneficial for users managing a large number of clients.

## Database Optimization Variables

These variables apply to database-related tasks and are especially helpful for MySQL users. If you’re using SQLite, these settings aren’t applicable since SQLite always operates with a single connection.

1. **SQLALCHEMY_POOL_SIZE**: Specifies the number of idle connections in the database connection pool. When the application starts, it will create up to 10 idle connections, ready for use.

   ```plaintext
   SQLALCHEMY_POOL_SIZE = 10
   ```

2. **SQLALCHEMY_MAX_OVERFLOW**: This variable allows up to 30 additional connections to be created if needed. Once they’re no longer required, these connections are closed and removed from the pool.

   ```plaintext
   SQLALCHEMY_MAX_OVERFLOW = 30
   ```

## Periodic Task Interval Variables

The following variables define the execution intervals for various periodic tasks in Marzban. Previously, these intervals were fixed, but now they can be customized based on user count and system load.

1. **JOB_CORE_HEALTH_CHECK_INTERVAL**: Specifies the interval, in seconds, for checking core health. If a core is unresponsive, it will be reset. Default is every 10 seconds.

   ```plaintext
   JOB_CORE_HEALTH_CHECK_INTERVAL = 10
   ```

2. **JOB_RECORD_NODE_USAGES_INTERVAL**: Manages the calculation of node usage, running every 30 seconds by default.

   ```plaintext
   JOB_RECORD_NODE_USAGES_INTERVAL = 30
   ```

3. **JOB_RECORD_USER_USAGES_INTERVAL**: Sets the interval, in seconds, for tracking user resource usage. Default is every 10 seconds.

   ```plaintext
   JOB_RECORD_USER_USAGES_INTERVAL = 10
   ```

4. **JOB_REVIEW_USERS_INTERVAL**: Checks users every 10 seconds to see if their time or data limits have been reached and updates their status to “limited” or “expired” if necessary.

   ```plaintext
   JOB_REVIEW_USERS_INTERVAL = 10
   ```

5. **JOB_SEND_NOTIFICATIONS_INTERVAL**: Defines the interval for checking the notification queue and sending out notifications, particularly used for webhook integrations. Default is every 30 seconds.

   ```plaintext
   JOB_SEND_NOTIFICATIONS_INTERVAL = 30
   ```

## Full List of Variables

You can find the complete `.env` file at the following link:
🔗 [Link to .env](https://github.com/Gozargah/Marzban/blob/master/.env.example)

**Note:** These variables are not automatically added to your `.env` file during an update. You will need to manually copy them from the example and add them to your `.env` file, then restart Marzban for the changes to take effect.
