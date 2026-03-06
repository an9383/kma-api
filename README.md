
```
kma-pjt-be
├─ .env
├─ .env.dev
├─ .env.local
├─ .env.prod
├─ .env.stg
├─ .eslintrc.cjs
├─ .prettierrc
├─ .swcrc
├─ dist
│  ├─ app.module.js
│  ├─ app.module.js.map
│  ├─ common
│  │  ├─ configs
│  │  │  ├─ mongo.config.js
│  │  │  ├─ mongo.config.js.map
│  │  │  ├─ redis.config.js
│  │  │  ├─ redis.config.js.map
│  │  │  ├─ typeorm.config.js
│  │  │  └─ typeorm.config.js.map
│  │  ├─ decorators
│  │  │  ├─ roles.decorator.js
│  │  │  └─ roles.decorator.js.map
│  │  ├─ filters
│  │  │  ├─ global-exception.filter.js
│  │  │  └─ global-exception.filter.js.map
│  │  ├─ guards
│  │  │  ├─ roles.guard.js
│  │  │  └─ roles.guard.js.map
│  │  ├─ interceptors
│  │  │  ├─ logging.interceptor.js
│  │  │  └─ logging.interceptor.js.map
│  │  └─ logging
│  │     ├─ db-query-log-patch.js
│  │     ├─ db-query-log-patch.js.map
│  │     ├─ typeorm-nest-logger.js
│  │     └─ typeorm-nest-logger.js.map
│  ├─ main.js
│  ├─ main.js.map
│  └─ modules
│     ├─ attach
│     │  ├─ attach.controller.js
│     │  ├─ attach.controller.js.map
│     │  ├─ attach.module.js
│     │  ├─ attach.module.js.map
│     │  ├─ attach.service.js
│     │  ├─ attach.service.js.map
│     │  └─ entities
│     │     ├─ attach-file.entity.js
│     │     └─ attach-file.entity.js.map
│     ├─ auth
│     │  ├─ auth.module.js
│     │  ├─ auth.module.js.map
│     │  ├─ auth.resolver.js
│     │  ├─ auth.resolver.js.map
│     │  ├─ auth.service.js
│     │  └─ auth.service.js.map
│     ├─ common-code
│     │  ├─ common-code.module.js
│     │  ├─ common-code.module.js.map
│     │  ├─ common-code.resolver.js
│     │  ├─ common-code.resolver.js.map
│     │  ├─ common-code.service.js
│     │  ├─ common-code.service.js.map
│     │  ├─ dto
│     │  │  ├─ common-code.input.js
│     │  │  └─ common-code.input.js.map
│     │  └─ entities
│     │     ├─ common-code.entity.js
│     │     └─ common-code.entity.js.map
│     ├─ health
│     │  ├─ health.controller.js
│     │  ├─ health.controller.js.map
│     │  ├─ health.module.js
│     │  └─ health.module.js.map
│     ├─ hwp
│     │  ├─ hwp.controller.js
│     │  ├─ hwp.controller.js.map
│     │  ├─ hwp.module.js
│     │  ├─ hwp.module.js.map
│     │  ├─ hwp.service.js
│     │  └─ hwp.service.js.map
│     └─ member
│        ├─ dto
│        │  ├─ member.input.js
│        │  └─ member.input.js.map
│        ├─ entities
│        │  ├─ member.entity.js
│        │  └─ member.entity.js.map
│        ├─ member.module.js
│        ├─ member.module.js.map
│        ├─ member.resolver.js
│        ├─ member.resolver.js.map
│        ├─ member.service.js
│        └─ member.service.js.map
├─ nest-cli.json
├─ package-lock.json
├─ package.json
├─ README.md
├─ repomix-output.xml
├─ src
│  ├─ app.module.ts
│  ├─ common
│  │  ├─ configs
│  │  │  ├─ mongo.config.ts
│  │  │  ├─ redis.config.ts
│  │  │  └─ typeorm.config.ts
│  │  ├─ decorators
│  │  │  └─ roles.decorator.ts
│  │  ├─ filters
│  │  │  └─ global-exception.filter.ts
│  │  ├─ guards
│  │  │  └─ roles.guard.ts
│  │  ├─ interceptors
│  │  │  └─ logging.interceptor.ts
│  │  └─ logging
│  │     ├─ db-query-log-patch.ts
│  │     └─ typeorm-nest-logger.ts
│  ├─ database
│  │  ├─ migrations
│  │  └─ seeds
│  ├─ main.ts
│  ├─ modules
│  │  ├─ attach
│  │  │  ├─ attach.controller.ts
│  │  │  ├─ attach.module.ts
│  │  │  ├─ attach.service.ts
│  │  │  └─ entities
│  │  │     └─ attach-file.entity.ts
│  │  ├─ auth
│  │  │  ├─ auth.module.ts
│  │  │  ├─ auth.resolver.ts
│  │  │  └─ auth.service.ts
│  │  ├─ common-code
│  │  │  ├─ common-code.module.ts
│  │  │  ├─ common-code.resolver.ts
│  │  │  ├─ common-code.service.ts
│  │  │  ├─ dto
│  │  │  │  └─ common-code.input.ts
│  │  │  └─ entities
│  │  │     └─ common-code.entity.ts
│  │  ├─ health
│  │  │  ├─ health.controller.ts
│  │  │  └─ health.module.ts
│  │  ├─ hwp
│  │  │  ├─ hwp.controller.ts
│  │  │  ├─ hwp.module.ts
│  │  │  ├─ hwp.service.ts
│  │  │  └─ scripts
│  │  │     ├─ hwp2html.py
│  │  │     └─ README.md
│  │  └─ member
│  │     ├─ dto
│  │     │  └─ member.input.ts
│  │     ├─ entities
│  │     │  └─ member.entity.ts
│  │     ├─ member.module.ts
│  │     ├─ member.resolver.ts
│  │     └─ member.service.ts
│  └─ schema.gql
├─ test
├─ tsconfig.json
└─ uploads
   ├─ 443854c6-c2cf-4a28-9307-10fa92703fdb
   │  ├─ 57366030-79a0-4e25-8913-c8eb9297c915
   │  └─ 709b42f2-c788-4bb5-8d5b-9ca70175ee57.local
   ├─ 47139c6d-8aef-4e22-b3d8-3db690ef0e19
   │  └─ 278ba1a4-d38b-4623-9df6-64d8a41d67ba.xlsx
   ├─ b880fd72-ea9e-43e4-8456-7827a4676042
   │  └─ aa71d786-848c-4dc3-ab80-a07ab26519dc.txt
   ├─ cf1cc0b8-a314-4c81-b0af-1544321df444
   │  └─ 53ced7ea-2451-426c-9be7-74d4bb47c108.xlsx
   └─ e005efc6-bd81-49b0-8bf0-61870a5aafbf
      └─ 91af3a80-a717-4319-9acb-2ccb8aeb4dfe.txt

```