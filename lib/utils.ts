import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


// 日付の表示を調整するスクリプト
import dayjs from "dayjs"; 
import timezone from "dayjs/plugin/timezone"; 
import utc from "dayjs/plugin/utc";
import ja from 'dayjs/locale/ja'; 



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 日付の設定
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(ja);　//ロケーションの設定

// 20xx.xx.xx の形式で出力
export const formatDate = (date: string) => {
  const formattedDate = dayjs(date).format('YYYY.MM.DD'); // 引数のdateを使う
  return formattedDate;
};

// 00/00の短い形式で出力
export const formatDateShort = (date: string) => {
  const formattedDateShort = dayjs(date).format('M/D');
  return formattedDateShort;
};

// 曜日を出力
export const formatDay = (date: string) => {
  const formattedDay = dayjs(date).format('ddd');
  return formattedDay;
};
