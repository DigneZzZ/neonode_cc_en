---
title: Настройка Multi-WAN в pfSense
description: Настройка автоматического переключения между двумя провайдерами с помощью Multi-WAN в pfSense.
tags:
  - pfSense
  - Multi-WAN
  - резервирование
  - интернет
series: network
draft: false
pubDate: 10 8 2024
---

**ДАНО:** Есть два провайдера, нужно сделать так, чтобы если отваливается один, автоматически переключаться на другого.

**РЕШЕНИЕ:** Multi-WAN в pfSense позволяет использовать несколько подключений к Интернету для достижения отказоустойчивости и большей пропускной способности.

---

![Image 1](https://openode.xyz/uploads/monthly_2023_10/image002.jpg.9b5561bba54e1451000b37e9ac452342.jpg)

![Image 2](https://openode.xyz/uploads/monthly_2023_10/image003.png.56254a316a481ba57679aab39e2b7b6d.png)

![Image 3](https://openode.xyz/uploads/monthly_2023_10/image006.jpg.21abe16fb2c64e8fe3920b4caafb3b0a.jpg)

![Image 4](https://openode.xyz/uploads/monthly_2023_10/image008.jpg.b14f47c2cca31c705c884f87eef8926b.jpg)

![Image 5](https://openode.xyz/uploads/monthly_2023_10/image010.jpg.ced4fbafcde1a701168359ddd46ca939.jpg)

![Image 6](https://openode.xyz/uploads/monthly_2023_10/image012.jpg.385530037411bfa026a02a31d9ac3834.jpg)

![Image 7](https://openode.xyz/uploads/monthly_2023_10/image013.png.7f368b53ad646271d0be937464f40a55.png)

![Image 8](https://openode.xyz/uploads/monthly_2023_10/image015.png.6410b02bfd355da246c6d18ac6774607.png)

![Image 9](https://openode.xyz/uploads/monthly_2023_10/image017.png.d22f39e063ae72501d2dd5c2fc0c736e.png)

![Image 10](https://openode.xyz/uploads/monthly_2023_10/image019.png.1eda0f459abd877b80ec7d7de1b6c5e0.png)

![Image 11](https://openode.xyz/uploads/monthly_2023_10/image021.png.e6b097aa51c84c84719511bd85a2ec54.png)

![Image 12](https://openode.xyz/uploads/monthly_2023_10/image002.jpg.1f4e7d404394fa094a8ea7eb27e6c05b.jpg)

![Image 13](https://openode.xyz/uploads/monthly_2023_10/image003.png.7440f306611f28206cb3451287671c7f.png)

![Image 14](https://openode.xyz/uploads/monthly_2023_10/image005.png.bd00cddbb5b6a10908c4b23b49b5002f.png)

![Image 15](https://openode.xyz/uploads/monthly_2023_10/image007.png.a4b063c26bf0e7cca76dace5a9055335.png)

![Image 16](https://openode.xyz/uploads/monthly_2023_10/image009.png.d574ab48490945e3f8903faf93ceb58d.png)

![Image 17](https://openode.xyz/uploads/monthly_2023_10/image011.png.447bf1b395873dcf6511a6952dc6cf8a.png)
