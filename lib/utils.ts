import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


// 日付の表示を調整するスクリプト
import dayjs from "dayjs"; 
import timezone from "dayjs/plugin/timezone"; 
import utc from "dayjs/plugin/utc";
import "dayjs/locale/ja"; 

// 設定
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("ja"); 
dayjs.tz.setDefault("Asia/Tokyo"); // 全体を日本時間基準に

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 20xx.xx.xx の形式で出力
export const formatDate = (date: string | Date) => {
  // tz() を呼ぶことで、入力された時間が日本時間として解釈・変換
  return dayjs(date).tz().format('YYYY.MM.DD');
};

// 00/00の短い形式で出力
export const formatDateShort = (date: string | Date) => {
  return dayjs(date).tz().format('M/D');
};

// 曜日を出力
export const formatDay = (date: string | Date) => {
  return dayjs(date).tz().format('ddd');
};
