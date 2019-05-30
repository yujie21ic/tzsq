## 安装依赖
```sh
npm i
npm run i
```

## 监控编译 运行
```sh
npm start
```

## 需要添加一个 src/config.ts 文件
```ts
import { ConfigType } from './ConfigType'

export const config: ConfigType = {
    //...
} 
```