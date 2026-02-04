import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "version-1.0/bitzoom/open-api",
    },
    {
      type: "category",
      label: "gateway",
      link: {
        type: "doc",
        id: "version-1.0/bitzoom/gateway",
      },
      items: [
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-gateway-ping",
          label: "/api/gateway/ping",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-gateway-time",
          label: "/api/gateway/time",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-adlquantile",
          label: "/api/v1/adlquantile",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-balance",
          label: "/api/v1/balance",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-commissionrate",
          label: "/api/v1/commissionrate",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-deleteorder",
          label: "/api/v1/deleteorder",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-depth",
          label: "/api/v1/depth",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-exchangeinfo",
          label: "/api/v1/exchangeinfo",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-historyorder",
          label: "/api/v1/historyorder",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-historyposition",
          label: "/api/v1/historyposition",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-historypositionmargin",
          label: "/api/v1/historypositionmargin",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-historytrade",
          label: "/api/v1/historytrade",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-klines",
          label: "/api/v1/klines",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-leverage",
          label: "/api/v1/leverage",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-margintype",
          label: "/api/v1/margintype",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-myfavorite",
          label: "/api/v1/myfavorite",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-openinterest",
          label: "/api/v1/openinterest",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-openorders",
          label: "/api/v1/openorders",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-order",
          label: "/api/v1/order",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-positionmargin",
          label: "/api/v1/positionmargin",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-positionrisk",
          label: "/api/v1/positionrisk",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-premiumindex",
          label: "/api/v1/premiumindex",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-symbolcategories",
          label: "/api/v1/symbolcategories",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-ticker",
          label: "/api/v1/ticker",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-ticker-bookticker",
          label: "/api/v1/ticker/bookticker",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-ticker-hr-24",
          label: "/api/v1/ticker/hr24",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-ticker-price",
          label: "/api/v1/ticker/price",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-trades",
          label: "/api/v1/trades",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-userinfohook",
          label: "/api/v1/userinfohook",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-wallet-depositrecord",
          label: "/api/v1/wallet/depositrecord",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-wallet-getaddresswhite",
          label: "/api/v1/wallet/getaddresswhite",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-wallet-getchain",
          label: "/api/v1/wallet/getchain",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-wallet-gettoken",
          label: "/api/v1/wallet/gettoken",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-wallet-setaddresswhite",
          label: "/api/v1/wallet/setaddresswhite",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-wallet-withdraw",
          label: "/api/v1/wallet/withdraw",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "version-1.0/bitzoom/api-v-1-wallet-withdrawrecord",
          label: "/api/v1/wallet/withdrawrecord",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
