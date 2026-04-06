import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


// 日付の表示を調整するスクリプト
import dayjs from "dayjs"; 
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone"; 
import ja from 'dayjs/locale/ja';

// 設定
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(ja);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 20xx.xx.xx の形式で出力
const toJST = (date: string) => dayjs(date).tz('Asia/Tokyo');

// 2025.01.01 形式
export const formatDate = (date: string) => {
  return toJST(date).format('YYYY.MM.DD');
};

// 1/1 形式
export const formatDateShort = (date: string) => {
  return toJST(date).format('M/D');
};

// 曜日
export const formatDay = (date: string) => {
  return toJST(date).format('ddd');
};