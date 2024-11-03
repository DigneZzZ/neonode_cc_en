/**
 * This configures the translations for all ui text in your website. 
 * 
 * All languages will follow this ordering/structure and will fallback to the
 * default language for any entries that haven't been translated 
 */
import type { SupportedLanguage } from "src/utils/i18n";

export default {
    "en": {
        "site.title": {
            text: "Neonode.cc - Mind space blog"
        },
        "site.description": {
            text: "IT Blog"
        },
        "profile.description": {
            text: "Digital content creater"
        },
        "blog.lastUpdated": {
            text: "Last updated:"
        },
        "sidebar.tableOfContents": {
            text: "Table of Contents"
        },
        "project.platform": {
            text: "PLATFORM"
        },
        "project.stack": {
            text: "STACK"
        },
        "project.website": {
            text: "WEBSITE"
        },
        "link.aeza": {
            text: "Aeza VPS (+15% on payment)"
        },
        "link.openode": {
            text: "Our community Openode.XYZ"
        },
        "link.kamatera": {
            text: "Best EU hosting (+1 month free)"
        },
        "link.4vps": {
            text: "VPS hosting - 4vps.su (-10% discount!)"
        }
    },
    "ru": {
        "site.title": {
            text: "Neonode.cc - Mind space blog"
        },
        "site.description": {
            text: "IT Blog"
        },
        "profile.description": {
            text: "Digital content creater"
        },
        "blog.lastUpdated": {
            text: "Последнее обновление:"
        },
        "sidebar.tableOfContents": {
            text: "Таблица контента"
        },
        "project.platform": {
            text: "ПЛАТФОРМА"
        },
        "project.stack": {
            text: "СТЭК"
        },
        "project.website": {
            text: "ВЕБСАЙТ"
        },
        "link.aeza": {
            text: "Aeza VPS (+15% к пополнению)"
        },
        "link.openode": {
            text: "Наше сообщество Openode.XYZ"
        },
        "link.kamatera": {
            text: "Лучший Евро-хостер VPS (+1 месяц бесплатно на 100$)"
        },
        "link.4vps": {
            text: "VPS hosting - 4vps.su (-10% скидка!)"
        }

        
    }
} as const satisfies TranslationUIEntries;

type TranslationUIEntries = Record<SupportedLanguage, Record<string, UIEntry>>;

export type UIEntry = { text: string };