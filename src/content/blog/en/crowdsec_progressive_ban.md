---
title: Dynamic Increase of Blocking Time in CrowdSec by a Factor of Three
description: A guide on modifying the expression for dynamic increase in blocking time in CrowdSec, so that it triples with each new incident.
tags:
  - CrowdSec
  - security
  - configuration
series: crowdsec
pubDate: 10 11 2024
---

# Dynamic Increase of Blocking Time in CrowdSec by a Factor of Three

While configuring CrowdSec, I remembered a feature in f2ban that allowed for a progressive increase in ban time for repeated incidents from the same IP, and thanks to Deniom, we figured out how to set it up.

By default, CrowdSec allows dynamic blocking time configuration via the `duration_expr` parameter.

## Modifying the duration_expr Parameter

The `duration_expr` parameter in CrowdSec enables you to set a dynamic blocking time based on the number of prior decisions for a specific IP address or range.

To adjust this parameter, I needed to modify the `/etc/crowdsec/profiles.yaml` file.

Here’s what my version of this line looked like:

```yaml
duration_expr: Sprintf('%dh', 8 * (3 ^ GetDecisionsCount(Alert.GetValue())))
```

### What Does This Line Do?

- **`GetDecisionsCount(Alert.GetValue())`** — a function that returns the number of prior decisions for the given IP address or range.
- **`3 ^ GetDecisionsCount(Alert.GetValue())`** — here, 3 is raised to the power of the number of prior decisions. This allows the blocking time to triple with each new incident.
- **`8 * (...)`** — the base blocking time is 8 hours, and it’s multiplied by the result of raising 3 to the power, creating a progressively increasing block duration.

Thus, the first block lasts for 8 hours, the second for 24 hours (8 * 3), the third for 72 hours (8 * 9), and so on.

## Why Is This Necessary?

This configuration allows for a stricter response to repeated incidents from the same IP address, enhancing security. With each new incident, the blocking time increases, helping to deter attackers from further attempts against your system.

## Where to Make the Changes

You need to make changes in the profiles file `/etc/crowdsec/profiles.yaml`. Open the file with your preferred text editor (e.g., `nano`):

```bash
sudo nano /etc/crowdsec/profiles.yaml
```

Find the block where `duration_expr` is defined, and replace it with the line mentioned above. After saving the file, restart the CrowdSec service:

```bash
sudo systemctl restart crowdsec
```

If no errors arise after restarting, then everything is set up successfully!

### Full Example of My /etc/crowdsec/profiles.yaml File:

```yaml
name: default_ip_remediation
#debug: true
filters:
 - Alert.Remediation == true && Alert.GetScope() == "Ip"
decisions:
 - type: ban
   duration: 12h

duration_expr: Sprintf('%dh', 8 * (3 ^ GetDecisionsCount(Alert.GetValue())))

on_success: break
---
name: default_range_remediation
#debug: true
filters:
 - Alert.Remediation == true && Alert.GetScope() == "Range"
decisions:
 - type: ban
   duration: 12h

duration_expr: Sprintf('%dh', 8 * (3 ^ GetDecisionsCount(Alert.GetValue())))

on_success: break
```

## Testing the Changes

To verify everything is working correctly, you can check the CrowdSec logs and ensure new blocks are applied with the correct duration.

```bash
sudo journalctl -u crowdsec -f
```

This allows you to monitor in real-time how CrowdSec applies blocks, ensuring the settings are correct.

### Over Time, You Can Observe the Blocks

Use the following command:

```bash
sudo cscli decisions list
```

---

Configuring progressive blocking time in CrowdSec is an excellent way to make your security more adaptive and reliable. If you have any ideas for further strengthening security or questions about configuration, share them in the Telegram channel!
