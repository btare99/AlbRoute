#!/usr/bin/env python3
"""
� Movie Rating System - Rate and track movies
Demonstrates 8 core Python concepts in a straightforward way
"""

import json
import re
import time
from datetime import datetime
from typing import Dict, List, Optional
from collections import Counter, defaultdict
from abc import ABC, abstractmethod
from functools import wraps
from contextlib import contextmanager


# ============================================================================
# 1. CUSTOM EXCEPTIONS
# ============================================================================

class MovieException(Exception):
    """Base exception for movie operations"""
    pass


class InvalidRatingError(MovieException):
    """Raised when rating is invalid"""
    pass


class MovieNotFoundError(MovieException):
    """Raised when movie doesn't exist"""
    pass


# ============================================================================
# 2. DECORATORS
# ============================================================================

def timing_decorator(func):
    """Measures function execution time"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start
        if duration > 0.1:
            print(f"⏱️  {func.__name__} took {duration:.3f}s")
        return result
    return wrapper


def validate_rating(func):
    """Validates rating before recording"""
    @wraps(func)
    def wrapper(self, movie_name: str, user_name: str, rating: float, *args, **kwargs):
        if not isinstance(rating, (int, float)) or not (0 <= rating <= 10):
            raise InvalidRatingError(f"Rating must be 0-10, got {rating}")
        if len(movie_name.strip()) == 0 or len(user_name.strip()) == 0:
            raise InvalidRatingError("Movie and user name cannot be empty")
        return func(self, movie_name, user_name, rating, *args, **kwargs)
    return wrapper


# ============================================================================
# 3. ABSTRACT CLASSES
# ============================================================================

class Media(ABC):
    """Abstract base class for all media"""
    
    def __init__(self, title: str, year: int):
        self.title = title
        self.year = year
        self.ratings: Dict[str, List[float]] = defaultdict(list)
    
    @abstractmethod
    def get_genre(self) -> str:
        """Returns media genre"""
        pass
    
    @abstractmethod
    def get_rating_weight(self) -> float:
        """Returns weight for calculating average rating"""
        pass
    
    def add_rating(self, user: str, rating: float) -> None:
        """Adds rating from user"""
        self.ratings[user].append(rating)
    
    def get_average_rating(self) -> float:
        """Returns average rating with weight"""
        all_ratings = [r for ratings in self.ratings.values() for r in ratings]
        if not all_ratings:
            return 0.0
        return sum(all_ratings) / len(all_ratings) * self.get_rating_weight()
    
    def get_stats(self) -> Dict:
        """Returns statistics for media"""
        all_ratings = [r for ratings in self.ratings.values() for r in ratings]
        if not all_ratings:
            return {'error': 'No ratings yet'}
        
        return {
            'title': self.title,
            'year': self.year,
            'genre': self.get_genre(),
            'total_ratings': len(all_ratings),
            'unique_users': len(self.ratings),
            'average': sum(all_ratings) / len(all_ratings),
            'max': max(all_ratings),
            'min': min(all_ratings)
        }


# ============================================================================
# 4. CONCRETE IMPLEMENTATIONS
# ============================================================================

class Movie(Media):
    """Represents a movie"""
    
    def __init__(self, title: str, year: int, director: str):
        super().__init__(title, year)
        self.director = director
    
    def get_genre(self) -> str:
        return "MOVIE"
    
    def get_rating_weight(self) -> float:
        return 1.0


class Series(Media):
    """Represents a TV series"""
    
    def __init__(self, title: str, year: int, seasons: int):
        super().__init__(title, year)
        self.seasons = seasons
    
    def get_genre(self) -> str:
        return f"SERIES ({self.seasons} seasons)"
    
    def get_rating_weight(self) -> float:
        return 1.05  # Slightly higher weight


class Documentary(Media):
    """Represents a documentary"""
    
    def __init__(self, title: str, year: int, topic: str):
        super().__init__(title, year)
        self.topic = topic
    
    def get_genre(self) -> str:
        return "DOCUMENTARY"
    
    def get_rating_weight(self) -> float:
        return 0.95  # Slightly lower weight


# ============================================================================
# 5. REGEX VALIDATION
# ============================================================================

class InputValidator:
    """Validates user input using regex"""
    
    @staticmethod
    def is_valid_movie_title(title: str) -> bool:
        """Validates movie title (alphanumeric + spaces + punctuation)"""
        pattern = r'^[a-zA-Z0-9\s\-\:\']{2,100}$'
        return re.match(pattern, title) is not None
    
    @staticmethod
    def is_valid_user_name(name: str) -> bool:
        """Validates user name"""
        pattern = r'^[a-zA-Z0-9\s]{2,30}$'
        return re.match(pattern, name) is not None
    
    @staticmethod
    def is_valid_year(year: str) -> bool:
        """Validates year"""
        pattern = r'^(19|20)\d{2}$'
        return re.match(pattern, year) is not None


# ============================================================================
# 6. CONTEXT MANAGER
# ============================================================================

@contextmanager
def safe_file_operation(filename: str, mode: str = 'r'):
    """Safe file operations context manager"""
    file = None
    try:
        file = open(filename, mode)
        yield file
    except FileNotFoundError:
        print(f"⚠️  File not found: {filename}")
        if mode == 'w':
            file = open(filename, mode)
            yield file
    finally:
        if file:
            file.close()


# ============================================================================
# 7. MAIN APPLICATION
# ============================================================================

class RatingTracker:
    """Tracks ratings for multiple media"""
    
    def __init__(self):
        self.media: Dict[str, Media] = {}
        self.data_file = 'movie_ratings.json'
    
    def add_media(self, media_type: str, title: str, year: int, 
                  extra_info: str) -> Media:
        """Adds a new media item"""
        if not InputValidator.is_valid_movie_title(title):
            raise MovieException("Invalid movie title")
        if not InputValidator.is_valid_year(str(year)):
            raise MovieException("Invalid year (use 1900-2099)")
        
        media_classes = {
            'movie': lambda: Movie(title, year, extra_info),
            'series': lambda: Series(title, year, int(extra_info)),
            'documentary': lambda: Documentary(title, year, extra_info)
        }
        
        if media_type.lower() not in media_classes:
            raise MovieException(f"Unknown media type: {media_type}")
        
        media = media_classes[media_type.lower()]()
        self.media[title] = media
        print(f"✅ Added {media_type}: {title} ({year})")
        return media
    
    @validate_rating
    @timing_decorator
    def rate_media(self, media_title: str, user_name: str, rating: float) -> None:
        """Records a rating for media"""
        if not InputValidator.is_valid_user_name(user_name):
            raise MovieException("Invalid user name")
        
        if media_title not in self.media:
            raise MovieNotFoundError(f"Media '{media_title}' not found")
        
        media = self.media[media_title]
        media.add_rating(user_name, rating)
        print(f"✅ {user_name} rated {media_title}: {rating}/10")
    
    def get_top_rated(self) -> List[tuple]:
        """Gets top rated media"""
        # 8. LAMBDA & LIST COMPREHENSIONS
        ratings = [
            (title, media.get_average_rating())
            for title, media in self.media.items()
        ]
        return sorted(ratings, key=lambda x: x[1], reverse=True)
    
    def get_user_ratings(self, user_name: str) -> Dict[str, List[float]]:
        """Gets all ratings by a user"""
        user_ratings = {}
        for title, media in self.media.items():
            if user_name in media.ratings:
                user_ratings[title] = media.ratings[user_name]
        return user_ratings
    
    def get_media_stats(self, media_title: str) -> Dict:
        """Gets statistics for media"""
        if media_title not in self.media:
            raise MovieNotFoundError(f"Media '{media_title}' not found")
        
        return self.media[media_title].get_stats()
    
    @timing_decorator
    def get_genre_summary(self) -> Dict:
        """Gets summary by genre"""
        # 6. COLLECTIONS - Counter
        genre_count = Counter(m.get_genre() for m in self.media.values())
        genre_avg = defaultdict(list)
        
        for media in self.media.values():
            genre_avg[media.get_genre()].append(media.get_average_rating())
        
        return {
            genre: {
                'count': genre_count[genre],
                'avg_rating': sum(genre_avg[genre]) / len(genre_avg[genre])
            }
            for genre in genre_count.keys()
        }
    
    @timing_decorator
    def save_data(self) -> None:
        """Saves all data to JSON"""
        data = {
            'media': {}
        }
        
        for title, media in self.media.items():
            data['media'][title] = {
                'type': media.__class__.__name__,
                'year': media.year,
                'ratings': {
                    user: ratings
                    for user, ratings in media.ratings.items()
                }
            }
        
        with safe_file_operation(self.data_file, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"✅ Data saved to {self.data_file}")
    
    @timing_decorator
    def load_data(self) -> None:
        """Loads data from JSON"""
        try:
            with safe_file_operation(self.data_file, 'r') as f:
                data = json.load(f)
                
                for title, media_data in data.get('media', {}).items():
                    media_type = media_data['type'].lower()
                    year = media_data['year']
                    
                    if media_type == 'movie':
                        media = Movie(title, year, "Unknown")
                    elif media_type == 'series':
                        media = Series(title, year, 1)
                    else:
                        media = Documentary(title, year, "Unknown")
                    
                    for user, ratings in media_data['ratings'].items():
                        for rating in ratings:
                            media.add_rating(user, rating)
                    
                    self.media[title] = media
                
                print(f"✅ Data loaded from {self.data_file}")
        except (json.JSONDecodeError, KeyError):
            print("⚠️  No valid data file found")


# ============================================================================
# 8. INTERACTIVE CLI
# ============================================================================

class MovieApp:
    """Interactive CLI application"""
    
    def __init__(self):
        self.tracker = RatingTracker()
    
    def show_menu(self) -> None:
        """Displays main menu"""
        print("\n" + "="*50)
        print("🎬 MOVIE RATING SYSTEM")
        print("="*50)
        print("1. Add Media")
        print("2. Rate Media")
        print("3. View Top Rated")
        print("4. View Media Stats")
        print("5. View User Ratings")
        print("6. Genre Summary")
        print("7. List All Media")
        print("8. Save Data")
        print("9. Load Data")
        print("0. Exit")
        print("="*50)
    
    def add_media(self) -> None:
        """Interactive media addition"""
        try:
            print("\nMedia Types: movie, series, documentary")
            media_type = input("Type: ").strip()
            title = input("Title: ").strip()
            year = input("Year (1900-2099): ").strip()
            
            if media_type.lower() == 'movie':
                extra = input("Director name: ").strip()
            elif media_type.lower() == 'series':
                extra = input("Number of seasons: ").strip()
            else:
                extra = input("Topic: ").strip()
            
            self.tracker.add_media(media_type, title, int(year), extra)
        except (ValueError, MovieException) as e:
            print(f"❌ Error: {str(e)}")
    
    def rate_media(self) -> None:
        """Interactive rating"""
        try:
            title = input("Media title: ").strip()
            user = input("Your name: ").strip()
            rating = float(input("Rating (0-10): "))
            self.tracker.rate_media(title, user, rating)
        except (ValueError, MovieException, InvalidRatingError) as e:
            print(f"❌ Error: {str(e)}")
    
    def view_top_rated(self) -> None:
        """Displays top rated media"""
        top = self.tracker.get_top_rated()
        
        print(f"\n⭐ Top Rated Media:")
        if not top:
            print("  No ratings yet")
            return
        
        for rank, (title, rating) in enumerate(top[:10], 1):
            print(f"  {rank}. {title}: {rating:.2f}/10")
    
    def view_media_stats(self) -> None:
        """Displays media statistics"""
        try:
            title = input("Media title: ").strip()
            stats = self.tracker.get_media_stats(title)
            
            print(f"\n📊 {title} Statistics:")
            for key, value in stats.items():
                if isinstance(value, float):
                    print(f"  {key}: {value:.2f}")
                else:
                    print(f"  {key}: {value}")
        except (MovieException, MovieNotFoundError) as e:
            print(f"❌ Error: {str(e)}")
    
    def view_user_ratings(self) -> None:
        """Displays user's ratings"""
        user = input("User name: ").strip()
        ratings = self.tracker.get_user_ratings(user)
        
        print(f"\n⭐ {user}'s Ratings:")
        if not ratings:
            print("  No ratings yet")
            return
        
        for title, scores in ratings.items():
            avg = sum(scores) / len(scores)
            print(f"  {title}: {avg:.2f}/10 ({len(scores)} times)")
    
    def view_genre_summary(self) -> None:
        """Displays genre summary"""
        summary = self.tracker.get_genre_summary()
        
        print(f"\n📈 Genre Summary:")
        for genre, info in summary.items():
            print(f"  {genre}: {info['count']} items, "
                  f"avg rating {info['avg_rating']:.2f}")
    
    def list_media(self) -> None:
        """Lists all media"""
        if not self.tracker.media:
            print("❌ No media added yet")
            return
        
        print("\n📋 All Media:")
        for title, media in self.tracker.media.items():
            print(f"  • {title} ({media.year}) - {media.get_genre()}")
    
    def run(self) -> None:
        """Main application loop"""
        print("🎬 Welcome to Movie Rating System!")
        
        while True:
            self.show_menu()
            choice = input("Select option: ").strip()
            
            if choice == "1":
                self.add_media()
            elif choice == "2":
                self.rate_media()
            elif choice == "3":
                self.view_top_rated()
            elif choice == "4":
                self.view_media_stats()
            elif choice == "5":
                self.view_user_ratings()
            elif choice == "6":
                self.view_genre_summary()
            elif choice == "7":
                self.list_media()
            elif choice == "8":
                try:
                    self.tracker.save_data()
                except MovieException as e:
                    print(f"❌ Error: {str(e)}")
            elif choice == "9":
                self.tracker.load_data()
            elif choice == "0":
                print("👋 Goodbye!")
                break
            else:
                print("❌ Invalid option!")


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    app = MovieApp()
    app.run()
