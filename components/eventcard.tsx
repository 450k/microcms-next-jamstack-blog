"use client";

import Link from 'next/link';
import { formatDate, formatDay, formatDateShort } from "@/lib/utils";
import type { EventListItem } from "@/lib/types";
import { CategoryBadge } from '@/components/category-badge';

// shad cn のパーツをインポート
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

import { useState, useEffect } from 'react';


export function EventCard() {
    const [posts, setPosts] = useState<EventListItem[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                console.log('[EventCard] Fetching events from /api/events...');
                const res = await fetch('/api/events');
                console.log('[EventCard] Response:', { status: res.status, statusText: res.statusText });
                
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error('[EventCard] API error response:', {
                        status: res.status,
                        statusText: res.statusText,
                        contentType: res.headers.get('content-type'),
                        bodyLength: errorText.length,
                        bodyPreview: errorText.substring(0, 500)
                    });
                    throw new Error(`API error: ${res.status} ${res.statusText}`);
                }
                
                const contentType = res.headers.get('content-type');
                if (!contentType?.includes('application/json')) {
                    const text = await res.text();
                    console.error('[EventCard] Unexpected content type:', contentType, 'Body:', text.substring(0, 200));
                    throw new Error(`Unexpected content type: ${contentType}`);
                }
                
                const data = await res.json();
                console.log('[EventCard] Events fetched successfully:', data.length, 'items');
                console.log('[EventCard] First event:', data[0]);
                console.log('[EventCard] First event categories:', data[0]?.eventCategory);
                console.log('[EventCard] All events:', data);
                setPosts(data);
            } catch (error) {
                console.error('[EventCard] Failed to fetch events:', error);
                setPosts([]);
            }
        };
        fetchPosts();
    }, []);

    // カテゴリーの一意なリストを取得
    const uniqueCategories = Array.from(
        new Set(posts.flatMap(post => post.eventCategory || []))
    ).filter(Boolean).sort();

    // フィルタ済みのポストを取得
    const filteredPosts = selectedCategory 
        ? posts.filter(post => post.eventCategory.includes(selectedCategory))
        : posts;

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        const dateA = new Date(a.eventDate);
        const dateB = new Date(b.eventDate);
        return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

    // 現在の日付より前のイベントを除外
    const now = new Date();
    now.setHours(0, 0, 0, 0); // 本日の00:00:00に設定
    const visiblePosts = sortedPosts.filter(post => {
        const eventDate = new Date(post.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= now;
    });

    return (
        <div>
            <div className='flex justify-between sortButton-container mb-4'>
                <div className="flex flex-col gap-4">
                    <ToggleGroup 
                        className='category-filter' 
                        type="single" 
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                        variant="outline"
                    >
                        <ToggleGroupItem 
                            value="" 
                            aria-label="すべて"
                        >
                            All
                        </ToggleGroupItem>
                        {uniqueCategories.map((category) => (
                            <ToggleGroupItem 
                                key={category} 
                                value={category} 
                                aria-label={category}
                            >
                                {category}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
                <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                     {sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                </Button>
            </div>
            <div className='container-event'>
            {visiblePosts.map((post) => {
                return (
                        <Card key={post.id} className="relative mx-auto w-full max-w-sm pt-0 flex card-item">
                            <div className="absolute inset-0 z-30 aspect-video" />
                            <img
                                src={post.eventPlace?.thumbnail_img.url}
                                alt="Event cover"
                                className="relative z-20 aspect-video w-full object-cover dark:brightness-40"
                            />
                            <CardHeader>
                                <CardAction>
                                    <CategoryBadge category={post.eventCategory?.[0]} />
                                </CardAction>
                                <CardTitle>{formatDateShort(post.eventDate)} <span>({formatDay(post.eventDate)})</span> {post.eventStartTime} {post.eventTitle}</CardTitle>
                            </CardHeader>
                            <CardDescription>
                                <div className='dataTable'>
                                    <div className='dataTable-subject'>開催日時：</div>
                                    <div className='dataTable-items'>{formatDateShort!(post.eventDate)}　{post.eventStartTime} ～　{post.eventHour}時間</div>
                                    <div className='dataTable-subject'> 場所：</div>
                                    <div className='dataTable-items'>{post.eventPlace?.courtName} ({post.eventCourtSurface})</div>
                                    <div className='dataTable-subject'>募集人数：</div>
                                    <div className='dataTable-items'>{post.eventMemberNum} 名</div>
                                    {/* <div className='dataTable-subject'>参加者：</div> */}
                                    {/* <div className='dataTable-items'>{post.member}</div> */}
                                </div>
                            </CardDescription>
                            <CardFooter className='flex justify-between'>
                                <Link href={`/events/${post.id}`}>
                                    <Button className="w-full bg-gray-800 hover:bg-gray-600">詳細情報</Button>
                                </Link>
                                <div className='entryCounter font-bold text-olive-700'>
                                  {(() => {
                                    const memberCount = post.member?.length || 0;
                                    const maxMembers = Number(post.eventMemberNum);
                                    const remaining = maxMembers - memberCount;
                                    return remaining <= 0 ? '✅ 満員御礼!!' : `あと${remaining}名！`;
                                  })()}
                                </div>
                            </CardFooter>
                        </Card>
                );
            })}
            </div>
        </div>
    )
}