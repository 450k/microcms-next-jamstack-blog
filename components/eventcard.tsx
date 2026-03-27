"use client";

import Link from 'next/link';
import { formatDate,formatDay,formatDateShort } from "@/lib/utils";


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

type EventPlace = {
  id: string;
  courtName: string;
  thumbnail_img: {
    url: string;
    height: number;
    width: number;
  };
};

type EventCategory = {
  id: string;
  name: string;
};

// ブログ記事の型定義
type Props = {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventPlace: EventPlace[];
  eventStartTime: string;
  eventHour: string;
  eventMemberNum: string;
  member: string[];
  eventCategory:  EventCategory;
  eventCourtNum: string;
  eventCourtSurface: string;
};


export function EventCard() {
    const [posts, setPosts] = useState<Props[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                console.log('Fetching events from /api/events...');
                const res = await fetch('/api/events');
                console.log('Response status:', res.status, res.statusText);
                
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error('API error response:', errorText);
                    throw new Error(`API error: ${res.status} ${res.statusText}`);
                }
                
                const data = await res.json();
                console.log('Events fetched successfully:', data.length, 'items');
                setPosts(data);
            } catch (error) {
                console.error('Failed to fetch events:', error);
                setPosts([]);
            }
        };
        fetchPosts();
    }, []);

    // カテゴリーの一意なリストを取得
    const uniqueCategories = Array.from(
        new Map(posts.map(post => [post.eventCategory.id, post.eventCategory])).values()
    );

    // フィルタ済みのポストを取得
    const filteredPosts = selectedCategory 
        ? posts.filter(post => post.eventCategory.id === selectedCategory)
        : posts;

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        const dateA = new Date(a.eventDate);
        const dateB = new Date(b.eventDate);
        return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
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
                                key={category.id} 
                                value={category.id} 
                                aria-label={category.name}
                            >
                                {category.name}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
                <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                     {sortOrder === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                </Button>
            </div>
            <div className='container-event'>
            {sortedPosts.map((post) => {
                return (
                        <Card key={post.id} className="relative mx-auto w-full max-w-sm pt-0 flex card-item">
                            <div className="absolute inset-0 z-30 aspect-video" />
                            <img
                                src={post.eventPlace[0]?.thumbnail_img.url}
                                alt="Event cover"
                                className="relative z-20 aspect-video w-full object-cover dark:brightness-40"
                            />
                            <CardHeader>
                                <CardAction>
                                    <Badge variant="secondary" className={post.eventCategory?.id}>{post.eventCategory?.name}</Badge>
                                </CardAction>
                                <CardTitle>{formatDateShort(post.eventDate)} <span>({formatDay(post.eventDate)})</span> {post.eventStartTime} {post.eventTitle}</CardTitle>
                            </CardHeader>
                            <CardDescription>
                                <div className='dataTable'>
                                    <div className='dataTable-subject'>開催日時：</div>
                                    <div className='dataTable-items'>{formatDateShort!(post.eventDate)}　{post.eventStartTime} ～　{post.eventHour}時間</div>
                                    <div className='dataTable-subject'> 場所：</div>
                                    <div className='dataTable-items'>{post.eventPlace?.[0]?.courtName} ({post.eventCourtSurface})</div>
                                    <div className='dataTable-subject'>募集人数：</div>
                                    <div className='dataTable-items'>{post.eventMemberNum} 名</div>
                                    {/* <div className='dataTable-subject'>参加者：</div> */}
                                    {/* <div className='dataTable-items'>{post.member}</div> */}
                                </div>
                            </CardDescription>
                            <CardFooter>
                                <Link href={`/event/${post.id}`}>
                                    <Button className="w-full bg-gray-800 hover:bg-gray-600">詳細情報</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                );
            })}
            </div>
        </div>
    )
}